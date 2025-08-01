"use client";

import { useState, useEffect } from "react";
import { ShinyButton } from "@/components/magicui/shiny-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Users, Star, Search, Tag } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { BlurFade } from "@/components/magicui/blur-fade";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  price: number;
  duration: number;
  level: string;
  image_url: string;
  category_id: number;
  discount: number;
  max_trainees: number;
  modules: number;
  course_code: string;
  status: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, categoryFilter, levelFilter]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((course) =>
        [course.title, course.description, course.instructor_name].some(
          (field) =>
            String(field || "")
              .toLowerCase()
              .includes(query)
        )
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.category_id.toString() === categoryFilter
      );
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((course) => course.level === levelFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleEnrollClick = (courseId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to enroll in courses.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    router.push(`/courses/${courseId}`);
  };

  const categoryIds = Array.from(
    new Set(courses.map((course) => course.category_id))
  );
  const levels = Array.from(new Set(courses.map((course) => course.level)));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <BlurFade delay={0.2}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">All Trainings</h1>
            <p className="text-gray-600 mb-6">
              Explore professional beauty training programs
            </p>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trainings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryIds.map((id) => (
                    <SelectItem key={`category-${id}`} value={id.toString()}>
                      Category #{id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </BlurFade>

        {/* Trainings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <BlurFade key={course.id} delay={0.2}>
              <Card
                className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="aspect-video relative">
                  <img
                    src={
                      course.image_url || "/placeholder.svg?height=200&width=300"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-amber-700 text-white">{course.level}</Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <div className="text-lg font-bold text-amber-700">
                      {course.price > 0 ? `$${course.price}` : "Free"}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Instructor: {course.instructor_name}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.floor(course.duration / 60)}h {course.duration % 60}m
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Max {course.max_trainees}
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      {course.discount}% off
                    </div>
                  </div>

                  <div className="flex space-x-5">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/courses/${course.id}`}>View Details</Link>
                    </Button>
                    <ShinyButton size="lg" 
                      onClick={() => handleEnrollClick(course.id)}
                      className="flex-1"
                    >
                      Enroll Now
                    </ShinyButton>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <BlurFade delay={0.2}>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No trainings found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </BlurFade>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
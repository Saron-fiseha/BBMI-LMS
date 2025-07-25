import { HeroSection } from "@/components/hero-section"
import { FeaturedCourses } from "@/components/featured-courses"
import { StatsSection } from "@/components/stats-section"
import { TrustedPartners } from "@/components/trusted-partners" 
import { Testimonials } from "@/components/testimonials"
import { CTASection } from "@/components/cta-section"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { PersistentAuthWrapper } from "@/components/persistent-auth-wrapper"

export default function HomePage() {
  return (
    <PersistentAuthWrapper>
      
      <div className="min-h-screen flex flex-col">
       <SiteHeader />
       <main className="flex-1">
         <HeroSection />
         <FeaturedCourses />
         <TrustedPartners />
         <StatsSection />
         <Testimonials />
         <CTASection />
       </main>
       <SiteFooter />
     </div>
      
    </PersistentAuthWrapper>
  )
}

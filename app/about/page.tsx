import { Metadata } from "next";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import ScrollAnimation from "@/components/ScrollAnimation";
import OverviewStats from "@/components/OverviewStats";
import CertificationGrid from "@/components/CertificationGrid";
import ServiceItems from "@/components/ServiceItems";
import HistoryTimeline from "@/components/HistoryTimeline";
import PartnerLogos from "@/components/PartnerLogos";
import aboutContent from "@/content/pages/about.json";

export const metadata: Metadata = {
  title: "DMC 소개 | 대동메디칼컨설팅",
  description: "의료기관 컨설팅 전문 기업 대동메디칼컨설팅을 소개합니다.",
};

export default function AboutPage() {
  return (
    <>
      <Hero
        title={aboutContent.hero.title}
        subtitle={aboutContent.hero.subtitle}
      />

      {/* Overview Section */}
      <Section background="white" animation="fadeInUp">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Title and Description */}
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-main mb-6 leading-tight">
                {aboutContent.overview.title}
              </h2>
              <p className="text-lg md:text-xl text-secondary leading-relaxed whitespace-pre-line">
                {aboutContent.overview.description.split(aboutContent.overview.highlightText).map((part, index, array) => {
                  if (index === array.length - 1) {
                    return <span key={index}>{part}</span>;
                  }
                  return (
                    <span key={index}>
                      {part}
                      <span className="text-point font-semibold">
                        {aboutContent.overview.highlightText}
                      </span>
                    </span>
                  );
                })}
              </p>
            </div>
          </ScrollAnimation>

          {/* Right: Statistics */}
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <OverviewStats stats={aboutContent.overview.stats} />
          </ScrollAnimation>
        </div>
      </Section>

      {/* Certifications Section */}
      <Section animation="fadeInUp">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-2xl md:text-3xl font-bold text-main mb-12 md:mb-16 text-center">
              {aboutContent.certifications.title}
            </h2>
          </ScrollAnimation>
          <CertificationGrid images={aboutContent.certifications.images} />
        </div>
      </Section>

      {/* Services Section */}
      <Section background="gray" animation="fadeInUp">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-main mb-6 text-center">
              {aboutContent.services.title.split("One-Stop").map((part, index, array) => (
                index === array.length - 1 ? (
                  <span key={index}>{part}</span>
                ) : (
                  <span key={index}>
                    {part}
                    <span className="text-point">One-Stop</span>
                  </span>
                )
              ))}
            </h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <p className="text-lg md:text-xl text-secondary leading-relaxed mb-12 text-center whitespace-pre-line">
              {aboutContent.services.description}
            </p>
          </ScrollAnimation>
          <ServiceItems items={aboutContent.services.items} />
        </div>
      </Section>

      {/* History Section */}
      <Section animation="fadeInUp">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-main mb-6 text-center">
              {aboutContent.history.title}
            </h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <p className="text-lg md:text-xl text-secondary leading-relaxed mb-12 text-center whitespace-pre-line">
              {aboutContent.history.description}
            </p>
          </ScrollAnimation>
          <HistoryTimeline periods={aboutContent.history.periods} />
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="gray" animation="fadeInUp" className="!py-8 md:!py-12">
        <div className="max-w-7xl mx-auto">
          <PartnerLogos 
            title={aboutContent.partners.title}
            logos={aboutContent.partners.logos}
          />
        </div>
      </Section>
    </>
  );
}

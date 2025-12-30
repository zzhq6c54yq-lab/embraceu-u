import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

const BASE_URL = "https://embraceu-mt.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export const SEOHead = ({
  title = "EmbraceU | Self-Love, Mental Wellness & Personal Growth App",
  description = "EmbraceU is a mental wellness and self-growth platform supporting daily confidence, self-love, and emotional balance. Mindfulness tools, mood tracking, breathwork rituals, and personal development journaling.",
  path = "",
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes("EmbraceU") ? title : `${title} | EmbraceU`;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEOHead;

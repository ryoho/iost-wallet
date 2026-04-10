# Design System

## Overview
Visual Personality: A technical, utility-focused, and highly structured aesthetic. It utilizes a "grid-and-border" approach reminiscent of blueprints or traditional documentation, featuring a stark monochrome base with disciplined use of functional colors for service categorization.
Density: High informational density but with significant whitespace within defined border constraints. 
Tone: Pragmatic, transparent, and developer-centric.
Layout: A robust side-bar navigation with a main content area that feels modular and contained within fixed borders. The application is centered with a max-width of 1300px.

## Colors
- **Primary Text/Border**: `#181818` (High contrast charcoal)
- **Background**: `#FFFFFF` (Pure white)
- **Muted Elements**: `#777777` (Muted gray for labels and descriptions)
- **Interactive Link**: `#039BE4` (Clear utility blue)
- **Surface/Snow**: `#F6F8FB` (Light blue-gray for code blocks and code tags)
- **Button/Action**: `#242424` (Deep charcoal, nearly black on hover)
- **Categorical Accent Colors (Functional)**:
  - Orange (Compute/General): Applied to EC2, Fargate, Lambda
  - Green (Storage): Applied to S3
  - Purple (Network): Applied to ELB, VPC, Route53, CloudFront
  - Blue (Database): Applied to RDS, Aurora, DynamoDB
  - Pink (Management/Integration): Applied to CloudWatch, API Gateway, SNS, SQS
  - Red (Engagement/Auth): Applied to SES, Cognito

## Typography
- **Heading Font**: `Satoshi`, sans-serif (used for main English headings and navigation links). Weights range from 300 to 900.
- **Body/Japanese Font**: Standard system sans-serif.
- **Monospace Font**: `Roboto Mono`, monospace (used for price numbers, code blocks, and technical data).
- **Hierarchy**:
  - `.large-heading`: 5rem (PC) / 3.8rem (Mobile), weight 450.
  - `.heading`: 1.6rem, letter-spacing 0.08em.
  - `.text-base`: 1.4rem (Mobile) to 1.5rem (PC).
  - `.text-sm`: 1.2rem.

## Elevation
- **Elevation Style**: Flat. There is a complete absence of soft box-shadows. 
- **Layering**: Depth is created entirely through 0.1rem solid borders (`--color-border`).
- **Focus States**: High-visibility 0.2rem solid borders or 0.4rem box-shadows in `#039BE4` (Blue) are used to indicate focus and hover for interactive zones.
- **Dividers**: Heavy reliance on `.section` and `.table` borders to define physical space.

## Components
- **Cart/Total Bar**: A fixed-position header element on PC (bottom on mobile) showing the total cost. It uses high-contrast typography and specific price formatting.
- **Service Grid**: A flexible grid of cards (`.landing-service-item`) featuring a service icon (80x80) on the left and a service name/description on the right.
- **Side Navigation**: A vertical menu with persistent borders, where active items are indicated by a small dark circle and icons are hidden on selection.
- **Accordions**: Borders transition on active states, utilizing dashed lines for internal separation.
- **Price Display**: Utilizes `Roboto Mono` for numbers to ensure tabular alignment, paired with text-based currency units.
- **Buttons**: Rounded (999em pill shape) or circular, primarily dark background with white text.

## Do's and Don'ts
- **Do**: Use solid 1px (#181818) borders to separate every major layout block.
- **Do**: Use `Roboto Mono` for any numerical value representing currency or data.
- **Do**: Apply categorical colors to service icons and their associated hover states.
- **Don't**: Use drop shadows or gradients; the interface must remain strictly flat.
- **Don't**: Change the fixed-width sidebar logic; it is a structural anchor for the application.

## Assets
- **EC2 Icon**: https://aws-rough.cc/img/icons/ec2.svg
- **Fargate Icon**: https://aws-rough.cc/img/icons/fargate.svg
- **Lambda Icon**: https://aws-rough.cc/img/icons/lambda.svg
- **S3 Icon**: https://aws-rough.cc/img/icons/s3.svg
- **ELB Icon**: https://aws-rough.cc/img/icons/elb.svg
- **VPC Icon**: https://aws-rough.cc/img/icons/vpc.svg
- **Route53 Icon**: https://aws-rough.cc/img/icons/route53.svg
- **CloudFront Icon**: https://aws-rough.cc/img/icons/cloudfront.svg
- **RDS Icon**: https://aws-rough.cc/img/icons/rds.svg
- **Aurora Icon**: https://aws-rough.cc/img/icons/aurora.svg
- **DynamoDB Icon**: https://aws-rough.cc/img/icons/dynamodb.svg
- **ElastiCache Icon**: https://aws-rough.cc/img/icons/elasticache.svg
- **CloudWatch Icon**: https://aws-rough.cc/img/icons/cloudwatch.svg
- **API Gateway Icon**: https://aws-rough.cc/img/icons/apigateway.svg
- **SNS Icon**: https://aws-rough.cc/img/icons/sns.svg
- **SQS Icon**: https://aws-rough.cc/img/icons/sqs.svg
- **SES Icon**: https://aws-rough.cc/img/icons/ses.svg
- **Cognito Icon**: https://aws-rough.cc/img/icons/cognito.svg
- **OG Image**: https://aws-rough.cc/img/og.png?d=2022012402
- **Apple Touch Icon**: https://aws-rough.cc/_nuxt/icons/icon_512.ag0A0200880.png
- **Favicon**: https://aws-rough.cc/_nuxt/icons/icon_64.ag0A0200880.png
- **Font Satoshi Variable (TTF)**: https://aws-rough.cc/fonts/Satoshi-Variable.ttf
- **Font Satoshi Variable (WOFF)**: https://aws-rough.cc/fonts/Satoshi-Variable.woff
- **Font Satoshi Variable (WOFF2)**: https://aws-rough.cc/fonts/Satoshi-Variable.woff2
- **Font Roboto Mono**: https://fonts.gstatic.com/s/robotomono/v31/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vqPQw.ttf
- **JS Asset 1**: https://aws-rough.cc/_nuxt/0a438e7.js
- **JS Asset 2**: https://aws-rough.cc/_nuxt/3fd013f.js
- **JS Asset 3**: https://aws-rough.cc/_nuxt/6961f05.js
- **JS Asset 4**: https://aws-rough.cc/_nuxt/cc56a2d.js
- **JS Asset 5**: https://aws-rough.cc/_nuxt/d6e9d73.js
- **Manifest**: https://aws-rough.cc/_nuxt/manifest.0e978807.json
- **Nuxt Static Manifest**: https://aws-rough.cc/_nuxt/static/1767575160/manifest.js
- **Nuxt Static Payload**: https://aws-rough.cc/_nuxt/static/1767575160/payload.js
- **Nuxt Static State**: https://aws-rough.cc/_nuxt/static/1767575160/state.js
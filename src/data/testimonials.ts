export type Testimonial = {
  id: string;
  name: string;
  role?: string;
  quote: string;
  rating?: number;
  verified: boolean;
  source?: string;
};

// Add feedback only after its source and permission to publish are confirmed.
export const testimonials: Testimonial[] = [];

export const verifiedTestimonials = testimonials.filter(
  (testimonial) => testimonial.verified,
);

export const trustPoints = [
  "Private by design",
  "No brokerage password required",
  "Beginner-friendly explanations",
  "Free diagnosis before upgrade",
];

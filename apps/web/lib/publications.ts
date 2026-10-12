import { cache } from "react";
import { getPublications, type PublicationStatus } from "./api";

// The root layout (to decide whether to show "Research" in the nav) and the Research page both need
// this list. React's cache() makes it one API request per page render. null means the API is down.
export const loadPublications = cache(async () => {
  try {
    return await getPublications();
  } catch {
    return null;
  }
});

export const statusLabels: Record<PublicationStatus, string> = {
  published: "Published",
  accepted: "Accepted",
  under_review: "Under review",
  preprint: "Preprint",
};

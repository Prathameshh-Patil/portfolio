import type { MDXComponents } from "mdx/types";

// Styles for the HTML that markdown produces in case studies. Required by @next/mdx in the App Router.
const components: MDXComponents = {
  h2: (props) => <h2 className="mb-4 mt-14 text-xl font-semibold tracking-tight first:mt-0" {...props} />,
  h3: (props) => <h3 className="mb-3 mt-8 font-semibold tracking-tight" {...props} />,
  p: (props) => <p className="my-4 leading-relaxed text-text/90" {...props} />,
  ul: (props) => <ul className="my-4 list-disc space-y-2 pl-5 leading-relaxed marker:text-muted" {...props} />,
  ol: (props) => <ol className="my-4 list-decimal space-y-2 pl-5 leading-relaxed marker:text-muted" {...props} />,
  strong: (props) => <strong className="font-semibold text-text" {...props} />,
  code: (props) => <code className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[0.85em]" {...props} />,
  a: ({ href = "", ...props }) => {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...props}
      />
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}

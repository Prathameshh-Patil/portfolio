import type { MDXComponents } from "mdx/types";
import { Children, isValidElement } from "react";

// Plain text of a heading's children, for its anchor id ("Key decisions and trade-offs" -> "key-decisions-and-trade-offs").
function textOf(node: React.ReactNode): string {
  return Children.toArray(node)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : isValidElement<{ children?: React.ReactNode }>(child) ? textOf(child.props.children) : ""))
    .join("");
}
const slugify = (node: React.ReactNode) =>
  textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Styles for the HTML that markdown produces in case studies. Required by @next/mdx in the App Router.
// h2s get ids so the case study's "On this page" list can link to them.
const components: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2 id={slugify(children)} className="mb-5 mt-16 text-2xl font-semibold tracking-[-0.02em] first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: (props) => <h3 className="mb-3 mt-10 text-lg font-semibold tracking-tight" {...props} />,
  p: (props) => <p className="my-5 text-[17px] leading-[1.75] text-text/85" {...props} />,
  ul: (props) => (
    <ul
      className="my-5 space-y-3 pl-5 text-[17px] leading-[1.7] text-text/85 [&>li]:relative [&>li]:pl-1 [&>li]:before:absolute [&>li]:before:-left-4 [&>li]:before:top-[0.7em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-accent"
      {...props}
    />
  ),
  ol: (props) => <ol className="my-5 list-decimal space-y-3 pl-5 text-[17px] leading-[1.7] text-text/85 marker:font-mono marker:text-sm marker:text-accent" {...props} />,
  strong: (props) => <strong className="font-semibold text-text" {...props} />,
  code: (props) => <code className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.82em] text-text" {...props} />,
  a: ({ href = "", ...props }) => {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className="font-medium text-accent underline decoration-accent/30 underline-offset-[3px] transition-colors hover:decoration-accent"
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

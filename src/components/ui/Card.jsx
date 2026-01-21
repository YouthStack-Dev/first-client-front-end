import React from "react";

export const Card = React.forwardRef(function Card(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={
        "rounded-xl border border-app-border bg-app-surface text-app-text-primary shadow-sm transition-all duration-300 hover:shadow-md " +
        className
      }
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef(function CardHeader(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={
        "flex flex-col space-y-1.5 p-6 border-b border-app-border " + className
      }
      {...props}
    />
  );
});

export const CardTitle = React.forwardRef(function CardTitle(
  { className = "", ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={
        "text-2xl font-semibold leading-none tracking-tight text-app-text-primary " +
        className
      }
      {...props}
    />
  );
});

export const CardDescription = React.forwardRef(function CardDescription(
  { className = "", ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={"text-sm text-app-text-secondary " + className}
      {...props}
    />
  );
});

export const CardContent = React.forwardRef(function CardContent(
  { className = "", ...props },
  ref
) {
  return <div ref={ref} className={"p-6 pt-0 " + className} {...props} />;
});

export const CardFooter = React.forwardRef(function CardFooter(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={
        "flex items-center p-6 pt-0 border-t border-app-border " + className
      }
      {...props}
    />
  );
});

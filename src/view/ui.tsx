import React from "react";
import classNames from "classnames";

export function PagePanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={classNames(
        "paper border border-thick page-panel w-full max-w-5xl",
        className
      )}
    >
      <div className="page-panel-body">{children}</div>
    </section>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={classNames("card-body", className)}>{children}</div>;
}

export function PageKicker({ children }: { children: React.ReactNode }) {
  return <p className="page-kicker">{children}</p>;
}

"use client";

import { useId, useState, type ReactNode } from "react";
import { MinusIcon, PlusIcon } from "@/components/Icon";

type ProductPdpAccordionsProps = {
  overview: ReactNode;
  reviews: ReactNode;
};

function AccordionBlock({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const tabId = useId();
  const panelId = `${tabId}-panel`;

  return (
    <div>
      <button
        type="button"
        id={tabId}
        className="group flex w-full items-center justify-between gap-3 border-b border-[#d2d2d2] py-2 text-left font-bold"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-base md:text-lg font-bold">
          {title}
        </span>
        <span className="block shrink-0 text-primary-lighter">
          {open ? <MinusIcon size={20} /> : <PlusIcon size={20} />}
        </span>
      </button>
      <div
        role="region"
        id={panelId}
        aria-labelledby={tabId}
        aria-hidden={!open}
        className={`overflow-hidden pt-4 transition-[max-height,opacity] ease-in-out duration-500 ${
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProductPdpAccordions({ overview, reviews }: ProductPdpAccordionsProps) {
  return (
    <div className="mt-6">
      <AccordionBlock title="Product Overview" defaultOpen={false}>
        {overview}
      </AccordionBlock>
      <AccordionBlock title="Reviews" defaultOpen={false}>
        {reviews}
      </AccordionBlock>
    </div>
  );
}

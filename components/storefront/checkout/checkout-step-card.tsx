import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CheckoutStepCardProps = {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function CheckoutStepCard({
  step,
  title,
  description,
  children,
  aside,
}: CheckoutStepCardProps) {
  return (
    <Card className="overflow-hidden rounded-[24px] border-border/70 bg-background shadow-sm">
      <CardHeader className="gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Badge
            variant="soft"
            className="w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground"
          >
            Paso {step}
          </Badge>
          <div className="space-y-2">
            <CardTitle className="text-[1.55rem] tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
              {title}
            </CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              {description}
            </p>
          </div>
        </div>
        {aside ? <div className="shrink-0 text-sm text-muted-foreground">{aside}</div> : null}
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

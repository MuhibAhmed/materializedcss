import { FlowText } from "@/components/ui/typography";

export function TypographyFlowText() {
  return (
    <FlowText className="max-w-2xl">
      Flow text changes size smoothly with the width of the screen. Resize the window to see the font size and line
      height adjust, so text stays readable on phones and large monitors alike.
    </FlowText>
  );
}

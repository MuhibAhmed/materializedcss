import {
  Footer,
  FooterContent,
  FooterCopyright,
  FooterLink,
  FooterLinks,
  FooterSection,
  FooterText,
  FooterTitle,
} from "@/components/ui/footer";

export function FooterDemo() {
  return (
    <Footer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Footer Content</FooterTitle>
          <FooterText>You can use rows and columns here to organize your footer content.</FooterText>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Links</FooterTitle>
          <nav aria-label="Footer">
            <FooterLinks>
              {["Link 1", "Link 2", "Link 3", "Link 4"].map((label) => (
                <li key={label}>
                  <FooterLink href="#!">{label}</FooterLink>
                </li>
              ))}
            </FooterLinks>
          </nav>
        </FooterSection>
      </FooterContent>
      <FooterCopyright>
        <span>© 2026 Copyright Text</span>
        <FooterLink href="#!">More Links</FooterLink>
      </FooterCopyright>
    </Footer>
  );
}

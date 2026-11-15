import { Button } from "@/components/ui/button";
import { MaterialIcon, MenuIcon } from "@/components/ui/icons";
import {
  Sidenav,
  SidenavCollapsible,
  SidenavContent,
  SidenavDivider,
  SidenavItem,
  SidenavSubheader,
  SidenavTrigger,
  SidenavUserView,
} from "@/components/ui/sidenav";

export function SidenavDemo() {
  return (
    <Sidenav>
      <SidenavTrigger asChild>
        <Button variant="flat">
          <MenuIcon />
          Open sidenav
        </Button>
      </SidenavTrigger>
      <SidenavContent label="Main navigation">
        <SidenavUserView
          background="/images/landscapes/night.svg"
          avatar="/images/avatars/ada.svg"
          avatarAlt="Ada Lovelace"
          name="Ada Lovelace"
          email="ada@example.com"
        />
        <SidenavItem href="#inbox" icon={<MaterialIcon name="inbox" />} active>
          Inbox
        </SidenavItem>
        <SidenavItem href="#starred" icon={<MaterialIcon name="star" />}>
          Starred
        </SidenavItem>
        <SidenavItem href="#sent" icon={<MaterialIcon name="send" />}>
          Sent
        </SidenavItem>
        <SidenavCollapsible title="Labels" icon={<MaterialIcon name="label" />}>
          <SidenavItem href="#work">Work</SidenavItem>
          <SidenavItem href="#family">Family</SidenavItem>
        </SidenavCollapsible>
        <SidenavDivider />
        <SidenavSubheader>Subheader</SidenavSubheader>
        <SidenavItem href="#settings">Settings</SidenavItem>
        <SidenavItem href="#help">Help &amp; feedback</SidenavItem>
      </SidenavContent>
    </Sidenav>
  );
}

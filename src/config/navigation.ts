import {
  BarChart3,
  ClipboardCheck,
  FilePlus2,
  FolderKanban,
  LayoutDashboard,
  LockKeyhole,
  MessagesSquare,
  UsersRound,
} from "lucide-react";

export const appNavigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Create Enrollment",
    href: "/create-enrollment",
    icon: FilePlus2,
  },
  {
    title: "TBO Pipeline",
    href: "/tbo",
    icon: UsersRound,
  },
  {
    title: "Private Cases",
    href: "/private-cases",
    icon: FolderKanban,
  },
  {
    title: "Checklists",
    href: "/checklists",
    icon: ClipboardCheck,
  },
  {
    title: "Requests",
    href: "/requests",
    icon: MessagesSquare,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: LockKeyhole,
  },
];

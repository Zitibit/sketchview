import Link from "next/link";
import { Menu } from "@ark-ui/react/menu";
import { ChevronDown, Heart } from "lucide-react";
import styles from "./header.module.css";
type MenuProps = {
  menu: Record<string, any>;
  children?: React.ReactNode;
};

export default function Header({ menu, children }: MenuProps) {
  return (
    <header className="headerContainer">
      <div className="header">
        {/* Tab-based Navigation */}
        <div className="header__item header__item__brand">
          <Link key={"section1"} href={`/`} passHref>
            sketchview
          </Link>
        </div>
        {children}
      </div>
    </header>
  );
}

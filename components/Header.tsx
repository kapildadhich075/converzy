import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FilePlus2 } from "lucide-react";
import UpgradeButton from "./UpgradeButton";
import ConfigForm from "./ConfigForm";
import Image from "next/image";

function Header() {
  return (
    <div className="flex justify-between bg-white shadow-sm p-5 border-b">
      <Link href="/dashboard" className="text-2xl flex gap-2 items-center">
        Converzy by{" "}
        <Image
          src="https://ik.imagekit.io/umdiwr6ma/tlr%20logo.png?updatedAt=1706964634422"
          alt="Converzy Logo"
          width={50}
          height={50}
          className="cursor-pointer object-contain
            bg-orange-600 rounded-full p-2
          "
        />
      </Link>

      <SignedIn>
        <div className="flex items-center space-x-2">
          <Button asChild variant="link" className="hidden md:flex">
            <Link href="/dashboard/upgrade">Pricing</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/dashboard">My Documents</Link>
          </Button>

          <Button asChild variant="outline" className="border-orange-600">
            <Link href="/dashboard/upload">
              <FilePlus2 className="text-orange-600" />
            </Link>
          </Button>

          <UpgradeButton />
          <UserButton />

          <ConfigForm />
        </div>
      </SignedIn>
    </div>
  );
}
export default Header;

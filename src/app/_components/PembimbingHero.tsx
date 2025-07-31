import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getNameInitials } from "@/service/getNameInitials";
import { UserX } from "lucide-react";

type UserData = {
  programStudi: string;
  avatar: string;
  nama: string;
  username: string;
};

export default function PembimbingHero({
  programStudi,
  avatar,
  nama,
  username,
}: UserData) {
  if (username === "") {
    return (
      <div className="w-full gap-3 flex-col items-center justify-center flex p-3 border rounded-xl ">
        <UserX width={30} height={30} />
        <h1>Belum Ditetapkan Pembimbing</h1>
      </div>
    );
  }

  return (
    <div className="w-full gap-3 flex p-3 border rounded-xl ">
      <Avatar className="h-20 w-20 rounded-xl">
        <AvatarImage
          src={`/image/profile-picture/${avatar}`}
          alt="foto-profil"
        />
        <AvatarFallback className="rounded-lg">
          {getNameInitials(nama)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="font-semibold">{nama}</h1>
        <h1>{username}</h1>

        <Badge variant={"secondary"}>{programStudi}</Badge>
      </div>
    </div>
  );
}

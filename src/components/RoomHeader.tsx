import { Users2 } from "lucide-react";
import { format } from "date-fns";
import { Room } from "@/hooks/useRooms";

interface RoomHeaderProps {
  room: Room;
  selectedDate: Date;
}

const RoomHeader = ({ room, selectedDate }: RoomHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border mb-6 -mx-4 px-4 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-purple rounded-full flex items-center justify-center shadow-glow">
          <Users2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
            {room.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {room.memberCount} member{room.memberCount !== 1 ? 's' : ''} • {format(selectedDate, 'MMM d, yyyy')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomHeader;
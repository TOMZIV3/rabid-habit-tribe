import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Plus, UserPlus, Users2 } from "lucide-react";
import { useRooms, Room } from "@/hooks/useRooms";
import { useState } from "react";
import CreateRoomDialog from "./CreateRoomDialog";
import JoinRoomDialog from "./JoinRoomDialog";

interface RoomSelectorProps {
  className?: string;
}

const RoomSelector = ({ className }: RoomSelectorProps) => {
  const { rooms, currentRoom, setCurrentRoom } = useRooms();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const handleRoomSelect = (room: Room) => {
    setCurrentRoom(room);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`justify-between ${className}`}
          >
            <div className="flex items-center space-x-2">
              <Users2 className="w-4 h-4" />
              <span className="truncate">
                {currentRoom?.name || "Select Room"}
              </span>
              {currentRoom && (
                <Badge variant="secondary" className="ml-2">
                  {currentRoom.memberCount}
                </Badge>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Your Rooms</DropdownMenuLabel>
          
          {rooms.length > 0 && (
            <DropdownMenuGroup>
              {rooms.map((room) => (
                <DropdownMenuItem
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className={`cursor-pointer ${
                    currentRoom?.id === room.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Users2 className="w-4 h-4" />
                      <span className="truncate">{room.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        {room.memberCount}
                      </Badge>
                      {room.isCreator && (
                        <Badge variant="outline" className="text-xs">
                          Owner
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setShowCreateDialog(true)}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowJoinDialog(true)}
              className="cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Room
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      <JoinRoomDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
      />
    </>
  );
};

export default RoomSelector;
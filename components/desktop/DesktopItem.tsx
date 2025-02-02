import React, { useRef, useEffect } from "react";
import { Edit, Folder, File, Trash2 } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Item, ModalState } from "@/types/desktop";

interface DesktopItemProps {
  item: Item;
  moveItem: (
    draggedId: string,
    targetId: string | null,
    sourcePath: string
  ) => void;
  openWindow: (item: Item) => void;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  onDragStart: (item: Item) => void;
  onDragEnd: () => void;
  deleteItem: (itemId: string) => void;
}

export const DesktopItem: React.FC<DesktopItemProps> = React.memo(
  ({
    item,
    moveItem,
    openWindow,
    setModalState,
    onDragStart,
    onDragEnd,
    deleteItem,
  }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
      type: "ITEM",
      item: () => {
        onDragStart(item);
        return item;
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (_, monitor) => {
        const dropResult = monitor.getDropResult<{ id: string }>();
        if (dropResult) {
          moveItem(
            item.id,
            dropResult.id === "desktop" ? null : dropResult.id,
            item.path
          );
        }
        onDragEnd();
      },
    });

    const [{ isOver, canDrop }, drop] = useDrop({
      accept: "ITEM",
      canDrop: (draggedItem: Item) =>
        item.type === "folder" && draggedItem.id !== item.id,
      drop: () => ({ id: item.id }),
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    });

    useEffect(() => {
      if (item.type === "folder" && ref.current) {
        drop(ref.current);
      }
    }, [drop, item.type]);

    const handleClick = () => {
      if (item.type === "file" && item.link) {
        window.open(item.link, "_blank");
      } else if (item.type === "folder") {
        openWindow(item);
      }
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={ref}
            className={`flex flex-col items-center cursor-pointer relative ${
              isDragging ? "opacity-50" : ""
            } ${isOver && canDrop ? "bg-blue-200/20" : ""}`}
            onClick={handleClick}
          >
            <div
              ref={(node) => {
                if (node) {
                  drag(node as unknown as HTMLElement);
                }
              }}
              className="p-2 flex items-center justify-center rounded-lg shadow-md border bg-neutral-800/30 backdrop-blur-xl border-neutral-800/60"
            >
              {item.type === "folder" ? (
                <Folder className="size-10 text-yellow-500" />
              ) : (
                <File className="size-10 text-blue-500" />
              )}
            </div>
            <span className="mt-2 text-sm text-center">{item.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {item.type === "file" ? (
            <ContextMenuItem
              onSelect={() =>
                setModalState({
                  open: true,
                  type: "edit",
                  itemType: "file",
                  parentId: item.parentId,
                  item,
                })
              }
            >
              <Edit className="mr-2 size-4" />
              <span>Edit Bookmark</span>
            </ContextMenuItem>
          ) : (
            <ContextMenuItem
              onSelect={() =>
                setModalState({
                  open: true,
                  type: "rename",
                  itemType: "folder",
                  parentId: item.parentId,
                  item,
                })
              }
            >
              <Edit className="mr-2 size-4" />
              <span>Rename Folder</span>
            </ContextMenuItem>
          )}
          <ContextMenuItem onSelect={() => deleteItem(item.id)}>
            <Trash2 className="mr-2 size-4" />
            <span>Delete {item.type === "folder" ? "Folder" : "Bookmark"}</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }
);

DesktopItem.displayName = "DesktopItem";

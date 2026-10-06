import React from "react";
import { Layers, RefreshCw, Plus, AlertTriangle } from "lucide-react";
import Button from "../../ui/Button";

export default function InRackToolbar({
  onShowPlates,
  onShowSwap,
  onAddSet,
  onShowPain
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={onShowPlates}
          className="text-xs"
        >
          <Layers className="h-4 w-4" />
          <span>Plates</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onShowSwap}
          className="text-xs"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Swap</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onAddSet}
          className="text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Set</span>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="md"
        onClick={onShowPain}
        className="text-xs text-warn hover:bg-warn/10"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Joint Pain?</span>
      </Button>
    </div>
  );
}

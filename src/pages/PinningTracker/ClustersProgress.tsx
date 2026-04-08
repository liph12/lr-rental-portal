import PinningTrackerCard from "../../components/cards/PinningTrackerCard";
import { useOutletContext } from "react-router-dom";
import type { PinningTrackerType } from "./Index";

interface PinningTrackerTypeProps {
  selectedTrackedPinningRow: PinningTrackerType;
}

export default function ClustersProgress() {
  const { selectedTrackedPinningRow } =
    useOutletContext<PinningTrackerTypeProps>();

  return selectedTrackedPinningRow ? (
    <PinningTrackerCard pinningTracker={selectedTrackedPinningRow} />
  ) : (
    <></>
  );
}

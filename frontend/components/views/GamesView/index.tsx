import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { useSelectableList } from "@/hooks";

const GamesView = () => {
  const options: SelectableListOption[] = [
    {
      type: "view",
      label: "打砖块",
      viewId: "brickGame",
      preview: SplitScreenPreview.Games,
    },
    {
      type: "view",
      label: "纸牌接龙",
      viewId: "solitaireGame",
      preview: SplitScreenPreview.Games,
    },
  ];

  const { activeIndex: scrollIndex } = useSelectableList({ viewId: "games", options });

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default GamesView;

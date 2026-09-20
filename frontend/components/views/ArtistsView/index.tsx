import { useCallback, useMemo } from "react";

import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { useSelectableList } from "@/hooks";
import * as Utils from "@/utils";
import { useFetchArtists } from "@/hooks/utils/useDataFetcher";

interface Props { artists?: MediaApi.Artist[]; inLibrary?: boolean; showImages?: boolean; }
const ArtistsView = ({ artists, inLibrary = true, showImages = false }: Props) => {
  const { data: fetchedArtists, fetchNextPage, isFetchingNextPage, isLoading } = useFetchArtists({ lazy: !!artists });
  const options: SelectableListOption[] = useMemo(() => (
    artists ?? fetchedArtists?.pages.flatMap((page) => page?.data ?? []) ?? []
  ).map((artist) => ({
    type: "view", headerTitle: artist.name, label: artist.name, viewId: "artist",
    imageUrl: showImages ? Utils.getArtwork(50, artist.artwork?.url) : undefined,
    props: { id: artist.id, inLibrary },
  })), [artists, fetchedArtists, inLibrary, showImages]);
  const handleNearEndOfList = useCallback(() => { if (!isFetchingNextPage) void fetchNextPage(); }, [fetchNextPage, isFetchingNextPage]);
  const { activeIndex } = useSelectableList({ viewId: "artists", options, onNearEndOfList: handleNearEndOfList });
  return <SelectableList loading={isLoading} loadingNextItems={isFetchingNextPage} options={options} activeIndex={activeIndex} emptyMessage="No saved artists" />;
};
export default ArtistsView;

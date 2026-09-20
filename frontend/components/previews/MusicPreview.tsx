import { useMemo } from "react";

import { KenBurns, LoadingScreen } from "@/components";
import { previewSlideRight } from "@/animation";
import { useFetchAlbums } from "@/hooks/utils/useDataFetcher";
import { getArtwork } from "@/utils";
import { motion } from "motion/react";
import styled from "styled-components";

const Container = styled(motion.div)`z-index: 1; position: absolute; inset: 0;`;
const MusicPreview = () => {
  const { data: albums, isLoading, error } = useFetchAlbums({ artworkSize: 400 });
  const artworkUrls = useMemo(() => error ? [] : albums?.pages.flatMap((page) => page?.data.map((album) => getArtwork(300, album.artwork?.url)).filter(Boolean) ?? []) ?? [], [albums, error]);
  return <Container {...previewSlideRight}>{isLoading && !albums ? <LoadingScreen backgroundColor="linear-gradient(180deg, #B1B5C0 0%, #686E7A 100%)" /> : <KenBurns urls={artworkUrls} />}</Container>;
};
export default MusicPreview;

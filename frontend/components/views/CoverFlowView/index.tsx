import { useCallback } from "react";

import LoadingScreen from "@/components/LoadingScreen";
import { useEventListener, useViewContext } from "@/hooks";
import { useFetchAlbums } from "@/hooks/utils/useDataFetcher";
import { IpodEvent } from "@/utils/events";
import styled from "styled-components";

import CoverFlow from "./CoverFlow";

const Container = styled.div`height: 100%; flex: 1;`;
const CoverFlowView = () => {
  const { hideView } = useViewContext();
  const { data, isLoading } = useFetchAlbums({ artworkSize: 350 });
  const albums = data?.pages.flatMap((page) => page?.data ?? []) ?? [];
  const handleMenuClick = useCallback(() => { if (isLoading) hideView(); }, [hideView, isLoading]);
  useEventListener<IpodEvent>("menuclick", handleMenuClick);
  return <Container>{isLoading ? <LoadingScreen backgroundColor="white" /> : <CoverFlow albums={albums} />}</Container>;
};
export default CoverFlowView;

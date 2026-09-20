import { ASSETS } from "@/assets";
import { Unit } from "@/utils/constants";
import styled from "styled-components";

import ProgressBar from "./ProgressBar";

const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 1em;
  padding: 0 ${Unit.SM};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(60%, transparent), to(rgba(250, 250, 250, 0.1)));
`;

const Icon = styled.img`
  font-size: 12px;
  margin: auto 0;
  width: 30px;
  height: 16px;
`;

const VolumeBar = ({ percent }: { percent: number }) => (
  <Container>
    <Icon src={ASSETS.volumeMute} />
    <ProgressBar percent={percent} />
    <Icon src={ASSETS.volumeFull} />
  </Container>
);

export default VolumeBar;

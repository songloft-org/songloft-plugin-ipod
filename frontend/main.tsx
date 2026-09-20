import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Ipod from "@/components/Ipod/Ipod";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Ipod />
    </StrictMode>,
  );
}

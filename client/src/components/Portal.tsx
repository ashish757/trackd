import React from "react";
import { createPortal } from "react-dom";

type PortalLayer = "modal" | "dropdown" | "toast";

interface PortalProps {
    children: React.ReactNode;
    layer?: PortalLayer;
}

const Portal: React.FC<PortalProps> = ({ children, layer = "modal" }) => {
    const layerId = `layer-${layer}`;
    const portalRoot = document.getElementById(layerId);
    if (!portalRoot) {
        console.warn(`Portal layer "${layerId}" not found in DOM.`);
        return null;
    }

    return createPortal(children, portalRoot);
};

export default Portal;

// Central GSAP setup — registers plugins once. Import from here in client
// components only (this module is pulled into the client bundle).
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

export { gsap, useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin };

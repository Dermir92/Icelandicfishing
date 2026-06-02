import type { FishingSpot } from "@/types/spot";

const BASE_GRADIENT =
  "bg-[radial-gradient(circle_at_top_left,rgba(170,193,197,0.28),transparent_34%),linear-gradient(180deg,rgba(18,52,59,0.24),rgba(18,52,59,0.82))]";

const BY_WATER_TYPE: Record<FishingSpot["waterType"], string> = {
  vatn: "from-[#8FA8AB]/45 via-[#47656A]/50 to-[#1B3B42]",
  á: "from-[#7A9AA0]/45 via-[#395B62]/55 to-[#17343B]",
  svæði: "from-[#9CB3B2]/42 via-[#4E6D71]/52 to-[#20393E]",
  óstaðfest: "from-[#9BA7A9]/35 via-[#53666A]/46 to-[#27383D]",
};

const BY_REGION: Record<FishingSpot["region"], string> = {
  Höfuðborgarsvæðið: "bg-[linear-gradient(135deg,rgba(152,170,174,0.28),rgba(18,52,59,0.1))]",
  Suðvesturland: "bg-[linear-gradient(135deg,rgba(161,176,182,0.24),rgba(27,58,65,0.12))]",
  Suðurland: "bg-[linear-gradient(135deg,rgba(165,181,178,0.22),rgba(30,64,61,0.12))]",
  Vesturland: "bg-[linear-gradient(135deg,rgba(156,169,176,0.24),rgba(31,59,68,0.12))]",
  Vestfirðir: "bg-[linear-gradient(135deg,rgba(149,164,154,0.22),rgba(35,60,52,0.12))]",
  Norðurland: "bg-[linear-gradient(135deg,rgba(174,192,198,0.22),rgba(31,62,70,0.12))]",
  Austurland: "bg-[linear-gradient(135deg,rgba(167,181,186,0.22),rgba(31,57,62,0.12))]",
  Hálendið: "bg-[linear-gradient(135deg,rgba(183,189,179,0.24),rgba(50,62,58,0.12))]",
  Óstaðfest: "bg-[linear-gradient(135deg,rgba(171,177,180,0.22),rgba(39,51,56,0.12))]",
};

const OVERLAY =
  "bg-[linear-gradient(180deg,rgba(9,23,26,0.06),rgba(9,23,26,0.46)),radial-gradient(circle_at_top,rgba(209,221,223,0.16),transparent_30%)]";

export function getSpotVisualClasses(spot: Pick<FishingSpot, "waterType" | "region">) {
  return {
    frame: `${BASE_GRADIENT} ${BY_WATER_TYPE[spot.waterType]} ${BY_REGION[spot.region]}`,
    overlay: OVERLAY,
  };
}

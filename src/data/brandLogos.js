import bajajLogo from "../assets/brands/bajaj-logo.svg";
import blueStarLogo from "../assets/brands/blue-star-logo.png";
import boschLogo from "../assets/brands/bosch-logo.svg";
import cromptonLogo from "../assets/brands/crompton-logo.svg";
import daikinLogo from "../assets/brands/daikin-logo.svg";
import haierLogo from "../assets/brands/haier-logo.svg";
import havellsLogo from "../assets/brands/havells-logo.svg";
import ifbLogo from "../assets/brands/ifb-logo.svg";
import lgLogo from "../assets/brands/lg-logo.svg";
import panasonicLogo from "../assets/brands/panasonic-logo.svg";
import samsungLogo from "../assets/brands/samsung-logo.svg";
import sonyLogo from "../assets/brands/sony-logo.svg";
import symphonyLogo from "../assets/brands/symphony-logo.png";
import voltasLogo from "../assets/brands/voltas-logo.svg";
import whirlpoolLogo from "../assets/brands/whirlpool-logo.svg";

export const brandLogos = {
  LG: lgLogo,
  Samsung: samsungLogo,
  Whirlpool: whirlpoolLogo,
  Haier: haierLogo,
  Voltas: voltasLogo,
  Daikin: daikinLogo,
  IFB: ifbLogo,
  Sony: sonyLogo,
  "Blue Star": blueStarLogo,
  Bosch: boschLogo,
  Panasonic: panasonicLogo,
  Bajaj: bajajLogo,
  Symphony: symphonyLogo,
  Crompton: cromptonLogo,
  Havells: havellsLogo,
};

export function getBrandLogo(brandName) {
  return brandLogos[brandName] ?? "";
}

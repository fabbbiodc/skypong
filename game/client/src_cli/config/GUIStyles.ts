import { Control } from "@babylonjs/gui";

export interface ITextStyle {
  color: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string;
  outlineWidth?: number;
  outlineColor?: string;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  horizontalAlignment?: number;
  verticalAlignment?: number;
  top?: string;
  textHorizontalAlignment?: number;
  textVerticalAlignment?: number;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
}

export interface IButtonStyle {
  width: string;
  height: string;
  color: string;
  background: string;
  fontSize: number;
  cornerRadius: number;
  horizontalAlignment?: number;
  verticalAlignment?: number;
  top?: string;
  zIndex?: number;
  thickness?: number;
  adaptWidthToChildren?: boolean;
  paddingLeft?: string;
  paddingRight?: string;
}

export interface IIconButtonStyle {
  width: string;
  height: string;
  background: string;
  iconUrl: string;
  iconWidth: string;
  iconHeight: string;
  cornerRadius: number;
  paddingRight?: string;
  paddingLeft?: string;
}

export interface IContainerStyle {
  background: string;
  cornerRadius: number;
  thickness: number;
  verticalAlignment?: number;
  horizontalAlignment?: number;
  width?: string;
  height?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  top?: string;
  left?: string;
}

const FONT_FAMILY = "'Space Grotesk', sans-serif";

export const GUI_STYLES = {
  FONT_FAMILY,
  TEXT: {
    DEFAULT: {
      color: "#FFFFFF",
      fontSize: 24,
      fontFamily: FONT_FAMILY,
      outlineWidth: 0,
    } as ITextStyle,
    HUD_NAME: {
      color: "#FFFFFF",
      fontSize: 42,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      shadowColor: "#01040080",
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowBlur: 4,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    HUD_NAME_MOBILE: {
      color: "#FFFFFF",
      fontSize: 28,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      shadowColor: "#01040080",
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowBlur: 4,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    HUD_SCORE: {
      color: "#FFFBFC90",
      fontSize: 32,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      shadowColor: "#01040080",
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowBlur: 4,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    HUD_SCORE_MOBILE: {
      color: "#FFFBFC90",
      fontSize: 22,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      shadowColor: "#01040080",
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowBlur: 4,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    COUNTDOWN: {
      color: "#FFFBFC90",
      fontSize: 120,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      shadowColor: "#01040080",
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowBlur: 4,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    GAME_OVER_TITLE: {
      color: "#FFFBFC90",
      fontSize: 64,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    GAME_OVER_WINNER: {
      color: "#FFFBFC90",
      fontSize: 48,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    GAME_OVER_SCORE: {
      color: "#FFFBFC90",
      fontSize: 36,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    } as ITextStyle,
    CONTROL_HINT: {
      color: "#FFFBFC90",
      fontSize: 16,
      fontFamily: FONT_FAMILY,
      fontWeight: "normal",
      shadowColor: "#01040080",
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowBlur: 4,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
      textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
      paddingLeft: "20px",
      paddingBottom: "20px",
    } as ITextStyle,
    SCORE_POPUP: {
      color: "#FFFFFF",
      fontSize: 56,
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      shadowColor: "#01040080",
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowBlur: 8,
      textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
      textVerticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
    } as ITextStyle,
  },

  BUTTON: {
    DEFAULT: {
      width: "280px",
      height: "60px",
      color: "#FFFFFF",
      background: "#475569",
      fontSize: 24,
      cornerRadius: 30,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
      thickness: 0,
    } as IButtonStyle,
  },

  ICON_BUTTON: {
    LEFT: {
      width: "200px",
      height: "180px",
      background: "transparent",
      iconUrl: "/icons/leftButton.svg",
      iconWidth: "160px",
      iconHeight: "160px",
      cornerRadius: 10,
      paddingRight: "20px",
    } as IIconButtonStyle,
    RIGHT: {
      width: "200px",
      height: "180px",
      background: "transparent",
      iconUrl: "/icons/rightButton.svg",
      iconWidth: "160px",
      iconHeight: "160px",
      cornerRadius: 10,
      paddingLeft: "20px",
    } as IIconButtonStyle,
    PAUSE: {
      width: "100px",
      height: "100px",
      background: "transparent",
      iconUrl: "/icons/pause.svg",
      iconWidth: "80px",
      iconHeight: "80px",
      cornerRadius: 8,
    } as IIconButtonStyle,
  },

  ICON_BUTTON_MOBILE: {
    LEFT: {
      width: "82px",
      height: "74px",
      background: "transparent",
      iconUrl: "/icons/leftButton.svg",
      iconWidth: "66px",
      iconHeight: "66px",
      cornerRadius: 10,
      paddingRight: "20px",
    } as IIconButtonStyle,
    RIGHT: {
      width: "82px",
      height: "74px",
      background: "transparent",
      iconUrl: "/icons/rightButton.svg",
      iconWidth: "66px",
      iconHeight: "66px",
      cornerRadius: 10,
      paddingLeft: "20px",
    } as IIconButtonStyle,
    PAUSE: {
      width: "41px",
      height: "41px",
      background: "transparent",
      iconUrl: "/icons/pause.svg",
      iconWidth: "33px",
      iconHeight: "33px",
      cornerRadius: 8,
    } as IIconButtonStyle,
  },

  CONTAINER: {
    HUD_PLAYER1: {
      background: "transparent",
      cornerRadius: 0,
      thickness: 0,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
      paddingBottom: "24px",
      top: "-24px",
    } as IContainerStyle,
    HUD_PLAYER2: {
      background: "transparent",
      cornerRadius: 0,
      thickness: 0,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_TOP,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
      paddingBottom: "24px",
      top: "32px",
    } as IContainerStyle,
    DEFAULT: {
      background: "transparent",
      cornerRadius: 0,
      thickness: 0,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
    } as IContainerStyle,
    OVERLAY: {
      background: "rgba(0, 0, 0, 0.8)",
      cornerRadius: 0,
      thickness: 0,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
      width: "100%",
      height: "100%",
    } as IContainerStyle,
  },

  TOUCH_CONTAINER: {
    height: "200px",
    horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
    verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
  },

  GAME_OVER_POSITIONS: {
    TITLE: { top: "-200px" },
    WINNER: { top: "-80px" },
    SCORE: { top: "20px" },
  },

  PAUSE_TITLE: {
    color: "#FFFBFC90",
    fontSize: 32,
    fontFamily: FONT_FAMILY,
    fontWeight: "bold",
    shadowColor: "#01040080",
    shadowOffsetX: 1,
    shadowOffsetY: 1,
    shadowBlur: 4,
    horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
  } as ITextStyle,

  PAUSE_POSITIONS: {
    TITLE: { top: "-100px" },
    RESUME_BUTTON: { top: "50px" },
    QUIT_BUTTON: { top: "130px" },
  },
};

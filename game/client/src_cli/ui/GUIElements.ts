import {
  Button,
  TextBlock,
  Rectangle,
  Control,
  Image,
  StackPanel,
} from "@babylonjs/gui";
import {
  ITextStyle,
  IButtonStyle,
  IContainerStyle,
  IIconButtonStyle,
} from "../config/GUIStyles";

export class GUIElements {
  public static CreateText(
    name: string,
    content: string,
    style: ITextStyle,
  ): TextBlock {
    const text = new TextBlock(name);
    text.text = content;
    text.color = style.color;
    text.fontSize = style.fontSize;

    if (style.fontFamily) text.fontFamily = style.fontFamily;
    if (style.fontWeight) text.fontWeight = style.fontWeight;
    if (style.outlineWidth) text.outlineWidth = style.outlineWidth;
    if (style.outlineColor) text.outlineColor = style.outlineColor;
    if (style.shadowColor) text.shadowColor = style.shadowColor;
    if (style.shadowOffsetX) text.shadowOffsetX = style.shadowOffsetX;
    if (style.shadowOffsetY) text.shadowOffsetY = style.shadowOffsetY;
    if (style.shadowBlur) text.shadowBlur = style.shadowBlur;
    if (style.horizontalAlignment)
      text.horizontalAlignment = style.horizontalAlignment;
    if (style.verticalAlignment)
      text.verticalAlignment = style.verticalAlignment;
    if (style.top) text.top = style.top;
    if (style.paddingTop) text.paddingTop = style.paddingTop;
    if (style.paddingBottom) text.paddingBottom = style.paddingBottom;
    if (style.paddingLeft) text.paddingLeft = style.paddingLeft;
    if (style.paddingRight) text.paddingRight = style.paddingRight;

    if (style.textHorizontalAlignment !== undefined) {
      text.textHorizontalAlignment = style.textHorizontalAlignment;
    }

    if (style.textVerticalAlignment !== undefined) {
      text.textVerticalAlignment = style.textVerticalAlignment;
    } else {
      text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    }

    text.resizeToFit = true;
    return text;
  }

  public static CreateTextButton(
    name: string,
    content: string,
    style: IButtonStyle,
    onClick?: () => void,
  ): Button {
    const btn = Button.CreateSimpleButton(name, content);
    btn.width = style.width;
    btn.height = style.height;
    btn.color = style.color;
    btn.background = style.background;
    btn.cornerRadius = style.cornerRadius;
    btn.thickness = 0;
    btn.fontSize = style.fontSize;

    if (style.horizontalAlignment)
      btn.horizontalAlignment = style.horizontalAlignment;
    if (style.verticalAlignment)
      btn.verticalAlignment = style.verticalAlignment;
    if (style.top) btn.top = style.top;
    if (style.zIndex) btn.zIndex = style.zIndex;
    if (style.adaptWidthToChildren)
      btn.adaptWidthToChildren = style.adaptWidthToChildren;
    if (style.paddingLeft) btn.paddingLeft = style.paddingLeft;
    if (style.paddingRight) btn.paddingRight = style.paddingRight;

    if (onClick) {
      btn.onPointerUpObservable.add(onClick);
    }

    btn.isHitTestVisible = true;
    btn.isPointerBlocker = true;
    return btn;
  }

  public static CreateIconButton(
    name: string,
    style: IIconButtonStyle,
    onPointerDown: () => void,
    onPointerUp: () => void,
  ): Button {
    const button = Button.CreateSimpleButton(name, "");
    button.width = style.width;
    button.height = style.height;
    button.background = style.background;
    button.cornerRadius = style.cornerRadius;
    button.thickness = 0;
    button.fontSize = 0;

    if (style.iconUrl) {
      const baseUrl = import.meta.env.BASE_URL || "/";
      const iconPath = style.iconUrl.startsWith("/")
        ? `${baseUrl}${style.iconUrl.slice(1)}`
        : `${baseUrl}${style.iconUrl}`;
      const icon = new Image(`${name}Icon`, iconPath);
      icon.width = style.iconWidth;
      icon.height = style.iconHeight;
      icon.stretch = Image.STRETCH_UNIFORM;
      icon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      icon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
      button.addControl(icon);
    }

    button.onPointerDownObservable.add(onPointerDown);
    button.onPointerUpObservable.add(onPointerUp);

    return button;
  }

  public static CreateContainer(
    name: string,
    style: IContainerStyle,
  ): Rectangle {
    const rect = new Rectangle(name);
    rect.background = style.background;
    rect.cornerRadius = style.cornerRadius;
    rect.thickness = style.thickness;
    rect.verticalAlignment =
      style.verticalAlignment ?? Control.VERTICAL_ALIGNMENT_CENTER;
    if (style.width) rect.width = style.width;
    if (style.height) rect.height = style.height;
    rect.adaptWidthToChildren = true;
    rect.adaptHeightToChildren = true;
    return rect;
  }

  public static CreateStackPanel(
    name: string,
    style: IContainerStyle,
    isVertical: boolean = true,
  ): StackPanel {
    const panel = new StackPanel(name);
    panel.isVertical = isVertical;
    panel.background = style.background;

    if (style.verticalAlignment !== undefined)
      panel.verticalAlignment = style.verticalAlignment;
    if (style.horizontalAlignment !== undefined)
      panel.horizontalAlignment = style.horizontalAlignment;
    if (style.paddingTop) panel.paddingTop = style.paddingTop;
    if (style.paddingBottom) panel.paddingBottom = style.paddingBottom;
    if (style.paddingLeft) panel.paddingLeft = style.paddingLeft;
    if (style.paddingRight) panel.paddingRight = style.paddingRight;

    if (style.top) panel.top = style.top;
    if (style.left) panel.left = style.left;

    return panel;
  }
}

function selectBestEffortImageForWidth(
    maxWidth: number,
    images: Array<Image>
): Image {
    var maxPixelWidth = maxWidth;
    //images = images.sort(function (a, b) { return a.width - b.width });
    images = images.sort((a, b) => (a.width - b.width) + "");
    return images.find(image => image.width >= maxPixelWidth) ||
        images[images.length - 1];
}

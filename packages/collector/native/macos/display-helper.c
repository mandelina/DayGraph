#include <CoreGraphics/CoreGraphics.h>
#include <stdint.h>
#include <stdio.h>

int main(void) {
  uint32_t display_count = 0;
  if (CGGetActiveDisplayList(0, NULL, &display_count) != kCGErrorSuccess ||
      display_count == 0) {
    return 1;
  }

  CGDirectDisplayID displays[display_count];
  if (CGGetActiveDisplayList(display_count, displays, &display_count) !=
      kCGErrorSuccess) {
    return 1;
  }

  for (uint32_t index = 0; index < display_count; index += 1) {
    const CGRect bounds = CGDisplayBounds(displays[index]);
    printf("%u,%.0f,%.0f,%.0f,%.0f\n", displays[index], bounds.origin.x,
           bounds.origin.y, bounds.size.width, bounds.size.height);
  }

  return 0;
}

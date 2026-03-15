#include <ApplicationServices/ApplicationServices.h>
#include <CoreFoundation/CoreFoundation.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

static CFMachPortRef g_event_tap = NULL;

static void emit_symbol(char symbol) {
  fputc(symbol, stdout);
  fputc('\n', stdout);
  fflush(stdout);
}

static CGEventRef handle_event(CGEventTapProxy proxy,
                               CGEventType type,
                               CGEventRef event,
                               void *user_info) {
  (void)proxy;
  (void)user_info;

  switch (type) {
    case kCGEventKeyDown:
      emit_symbol('k');
      break;
    case kCGEventLeftMouseDown:
    case kCGEventRightMouseDown:
    case kCGEventOtherMouseDown:
      emit_symbol('c');
      break;
    case kCGEventTapDisabledByTimeout:
    case kCGEventTapDisabledByUserInput:
      if (g_event_tap != NULL) {
        CGEventTapEnable(g_event_tap, true);
      }
      break;
    default:
      break;
  }

  return event;
}

static void request_accessibility_prompt(void) {
  const void *keys[] = {kAXTrustedCheckOptionPrompt};
  const void *values[] = {kCFBooleanTrue};
  CFDictionaryRef options = CFDictionaryCreate(
      kCFAllocatorDefault,
      keys,
      values,
      1,
      &kCFTypeDictionaryKeyCallBacks,
      &kCFTypeDictionaryValueCallBacks);

  if (options != NULL) {
    AXIsProcessTrustedWithOptions(options);
    CFRelease(options);
  }
}

int main(void) {
  request_accessibility_prompt();

  CGEventMask event_mask = CGEventMaskBit(kCGEventKeyDown) |
                           CGEventMaskBit(kCGEventLeftMouseDown) |
                           CGEventMaskBit(kCGEventRightMouseDown) |
                           CGEventMaskBit(kCGEventOtherMouseDown);

  g_event_tap = CGEventTapCreate(kCGSessionEventTap,
                                 kCGHeadInsertEventTap,
                                 kCGEventTapOptionListenOnly,
                                 event_mask,
                                 handle_event,
                                 NULL);

  if (g_event_tap == NULL) {
    fprintf(stderr,
            "[input-helper] failed to create event tap; grant Accessibility/Input Monitoring permission.\n");
    return 1;
  }

  CFRunLoopSourceRef source =
      CFMachPortCreateRunLoopSource(kCFAllocatorDefault, g_event_tap, 0);
  if (source == NULL) {
    fprintf(stderr, "[input-helper] failed to create run loop source.\n");
    CFRelease(g_event_tap);
    return 1;
  }

  CFRunLoopAddSource(CFRunLoopGetCurrent(), source, kCFRunLoopCommonModes);
  CGEventTapEnable(g_event_tap, true);
  fprintf(stderr, "[input-helper] event tap started\n");
  CFRunLoopRun();

  CFRelease(source);
  CFRelease(g_event_tap);
  return 0;
}

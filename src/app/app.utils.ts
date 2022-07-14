export class AppUtils {
  public static async KeepScreenOn(): Promise<void> {
    try {
      const anyNav: any = navigator;
      if ('wakeLock' in navigator) {
        const wakeLock = await anyNav['wakeLock'].request('screen');
      }
    } catch (err) {
      // the wake lock request fails - usually system related, such being low on battery
      console.log(err);
    }
  }

}
import { sessionBus } from 'dbus-native';

function registerBindings(service, session) {
  session.getService(service.bus_name).getInterface(
    service.path,
    service.interface,
    (err, iface) => {
      if (!err) {
        iface.on('MediaPlayerKeyPressed', (n, keyName) => {
          switch (keyName) {
            case 'Next': Emitter.sendToGooglePlayMusic('playback:nextTrack'); return;
            case 'Previous': Emitter.sendToGooglePlayMusic('playback:previousTrack'); return;
            case 'Play': Emitter.sendToGooglePlayMusic('playback:playPause'); return;
            case 'Stop': Emitter.sendToGooglePlayMusic('playback:stop'); return;
            default: return;
          }
        });
        // FIXME: This should be called every time the window is focused
        //        as this allows multiple applications to share control.
        iface.GrabMediaPlayerKeys('google-play-music-desktop-player', 0); // eslint-disable-line
        Logger.info(`Bound media keys for ${service.bus_name}`);
      }
    }
  );
}

try {
  const session = sessionBus();

  const services = [
    {
      bus_name: 'org.gnome.SettingsDaemon.MediaKeys',
      path: '/org/gnome/SettingsDaemon/MediaKeys',
      interface: 'org.gnome.SettingsDaemon.MediaKeys',
    },
    {
      bus_name: 'org.gnome.SettingsDaemon',
      path: '/org/gnome/SettingsDaemon/MediaKeys',
      interface: 'org.gnome.SettingsDaemon.MediaKeys',
    },
    {
      bus_name: 'org.mate.SettingsDaemon',
      path: '/org/mate/SettingsDaemon/MediaKeys',
      interface: 'org.mate.SettingsDaemon.MediaKeys',
    },
  ];

  Logger.debug('Binding mediakeys');
  services.forEach((service) => { registerBindings(service, session); });
} catch (e) {
  Logger.warn(`Failed to bind mediakeys: ${e}`);
}

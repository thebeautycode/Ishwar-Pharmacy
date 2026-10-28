/**
 * Browser-based Push Notification Service using HTML5 Notification API
 */

export class NotificationService {
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      alert('Browser notifications are not supported in this browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.sendNotification('Ishwar Pharmacy Notifications Enabled! 🔔', {
          body: 'You will receive real-time alerts for medicine delivery status and clinic appointments.',
          icon: '/assets/aistudio/Mediacal_Store_Pachrukhiya_Logo_931f9324.jpeg',
        });
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  public static sendNotification(title: string, options?: NotificationOptions) {
    if (!this.isSupported()) return;
    if (Notification.permission !== 'granted') return;

    try {
      const defaultIcon = '/assets/aistudio/Mediacal_Store_Pachrukhiya_Logo_931f9324.jpeg';
      const notification = new Notification(title, {
        icon: defaultIcon,
        badge: defaultIcon,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn('Notification trigger failed:', e);
    }
  }

  // Specific triggers
  public static notifyOrderStatus(orderNumber: string, status: string, village: string) {
    const statusLabels: Record<string, string> = {
      pending: 'Order Received & Being Prepared',
      packed: 'Parcel Packed & Verified by Pharmacist',
      out_for_delivery: `Rider Out for Delivery to ${village}! 🛵`,
      delivered: 'Order Delivered Successfully! ✅',
      cancelled: 'Order Cancelled',
    };

    const label = statusLabels[status] || status;
    this.sendNotification(`Ishwar Pharmacy Order #${orderNumber}`, {
      body: `Status Update: ${label}. Tap to view receipt and tracking details.`,
      tag: `order-${orderNumber}`,
    });
  }

  public static notifyAppointmentConfirmed(appointmentNumber: string, service: string, date: string, slot: string) {
    this.sendNotification(`Clinic Appointment Confirmed! 🩺`, {
      body: `Token #${appointmentNumber} for ${service} on ${date} at ${slot}. Goraya Ghat Road Clinic.`,
      tag: `apt-${appointmentNumber}`,
    });
  }

  public static notifyAppointmentBooking(appointmentNumber: string, date: string, slot: string, service?: string) {
    this.notifyAppointmentConfirmed(appointmentNumber, service || 'Clinic Consultation', date, slot);
  }

  public static notifyAppointmentReminder(appointmentNumber: string, patient: string, timeSlot: string) {
    this.sendNotification(`Reminder: Clinic Appointment Today! ⏰`, {
      body: `Namaste ${patient}, your consultation is scheduled at ${timeSlot} at Ishwar Pharma Clinic.`,
      tag: `apt-reminder-${appointmentNumber}`,
    });
  }
}

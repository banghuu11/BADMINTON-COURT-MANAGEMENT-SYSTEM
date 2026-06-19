export interface PricingSlot {
  pricingid: number;
  starttime: string;
  endtime: string;
  price: number;
  daytype: "Weekday" | "Weekend" | "All";
}

export interface BookedSlot {
  starttime: string;
  endtime: string;
  positionindex: number;
}

export interface Slot3D {
  id: number;
  top: string;
  left: string;
  label: string;
}

export interface BookingPayload {
  bookingType: string;
  note: string;
  slots: {
    courtId: number;
    playDate: string;
    startTime: string;
    endTime: string;
    appliedPrice: number;
    positionIndex: number;
  }[];
}

export interface MatchPayload {
  courtId: number;
  playDate: string;
  startTime: string;
  endTime: string;
}

export interface MatchData {
  waitid: number;
  avatarurl: string | null;
  fullname: string;
  venuename: string;
  courtname: string;
  playdate: string;
  starttime: string;
  endtime: string;
}

export interface JoinMatchResponse {
  message: string;
  contact: {
    fullname: string;
    phonenumber: string;
  };
}

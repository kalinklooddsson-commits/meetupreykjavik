import type {
  AccountType,
  AttendanceStatus,
  BlockScope,
  BookingStatus,
  CostType,
  DealTier,
  DealType,
  EventStatus,
  EventType,
  GroupMemberRole,
  GroupMemberStatus,
  GroupStatus,
  GroupVisibility,
  InviteStatus,
  JoinMode,
  Locale,
  NotificationType,
  PartnershipTier,
  ReviewerType,
  RsvpMode,
  RsvpStatus,
  TransactionType,
  VenueStatus,
  VenueType,
} from "@/types/domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: readonly {
    foreignKeyName: string;
    columns: readonly string[];
    referencedRelation: string;
    referencedColumns: readonly string[];
  }[];
};

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        {
          id: string;
          display_name: string;
          slug: string;
          email: string | null;
          avatar_url: string | null;
          bio: string | null;
          city: string;
          languages: string[];
          interests: string[];
          locale: Locale;
          age_range: string | null;
          account_type: AccountType;
          is_premium: boolean;
          premium_tier: string | null;
          premium_expires_at: Timestamp | null;
          is_verified: boolean;
          is_suspended: boolean;
          suspended_at: Timestamp | null;
          last_active_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        },
        {
          id: string;
          display_name: string;
          slug: string;
          email?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string;
          languages?: string[];
          interests?: string[];
          locale?: Locale;
          age_range?: string | null;
          account_type?: AccountType;
          is_premium?: boolean;
          premium_tier?: string | null;
          premium_expires_at?: Timestamp | null;
          is_verified?: boolean;
          is_suspended?: boolean;
          suspended_at?: Timestamp | null;
          last_active_at?: Timestamp | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        },
        Partial<{
          display_name: string;
          slug: string;
          email: string | null;
          avatar_url: string | null;
          bio: string | null;
          city: string;
          languages: string[];
          interests: string[];
          locale: Locale;
          age_range: string | null;
          account_type: AccountType;
          is_premium: boolean;
          premium_tier: string | null;
          premium_expires_at: Timestamp | null;
          is_verified: boolean;
          is_suspended: boolean;
          suspended_at: Timestamp | null;
          last_active_at: Timestamp | null;
          updated_at: Timestamp;
        }>
      >;
      categories: TableDefinition<
        {
          id: string;
          name_en: string;
          name_is: string;
          slug: string;
          icon_letter: string;
          bg_color: string;
          text_color: string;
          description_en: string | null;
          description_is: string | null;
          sort_order: number;
          is_active: boolean;
        },
        {
          id: string;
          name_en: string;
          name_is: string;
          slug: string;
          icon_letter: string;
          bg_color: string;
          text_color: string;
          description_en?: string | null;
          description_is?: string | null;
          sort_order?: number;
          is_active?: boolean;
        },
        Partial<{
          name_en: string;
          name_is: string;
          slug: string;
          icon_letter: string;
          bg_color: string;
          text_color: string;
          description_en: string | null;
          description_is: string | null;
          sort_order: number;
          is_active: boolean;
        }>
      >;
      venues: TableDefinition<
        {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          legal_name: string | null;
          kennitala: string | null;
          type: VenueType;
          description: string | null;
          address: string;
          city: string;
          latitude: number | null;
          longitude: number | null;
          capacity_seated: number | null;
          capacity_standing: number | null;
          capacity_total: number | null;
          amenities: string[];
          photos: string[];
          hero_photo_url: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          social_links: Json;
          opening_hours: Json;
          happy_hour: Json;
          partnership_tier: PartnershipTier;
          is_verified: boolean;
          status: VenueStatus;
          avg_rating: number;
          review_count: number;
          events_hosted: number;
          total_attendees: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        },
        {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          legal_name?: string | null;
          kennitala?: string | null;
          type: VenueType;
          description?: string | null;
          address: string;
          city?: string;
          latitude?: number | null;
          longitude?: number | null;
          capacity_seated?: number | null;
          capacity_standing?: number | null;
          capacity_total?: number | null;
          amenities?: string[];
          photos?: string[];
          hero_photo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          social_links?: Json;
          opening_hours?: Json;
          happy_hour?: Json;
          partnership_tier?: PartnershipTier;
          is_verified?: boolean;
          status?: VenueStatus;
          avg_rating?: number;
          review_count?: number;
          events_hosted?: number;
          total_attendees?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        },
        Partial<{
          owner_id: string;
          name: string;
          slug: string;
          legal_name: string | null;
          kennitala: string | null;
          type: VenueType;
          description: string | null;
          address: string;
          city: string;
          latitude: number | null;
          longitude: number | null;
          capacity_seated: number | null;
          capacity_standing: number | null;
          capacity_total: number | null;
          amenities: string[];
          photos: string[];
          hero_photo_url: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          social_links: Json;
          opening_hours: Json;
          happy_hour: Json;
          partnership_tier: PartnershipTier;
          is_verified: boolean;
          status: VenueStatus;
          avg_rating: number;
          review_count: number;
          events_hosted: number;
          total_attendees: number;
          updated_at: Timestamp;
        }>
      >;
      venue_availability: TableDefinition<
        {
          id: string;
          venue_id: string;
          day_of_week: number | null;
          specific_date: string | null;
          start_time: string;
          end_time: string;
          capacity_override: number | null;
          cost_type: CostType | null;
          cost_amount: number | null;
          notes: string | null;
          is_recurring: boolean;
          is_blocked: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          venue_id: string;
          day_of_week?: number | null;
          specific_date?: string | null;
          start_time: string;
          end_time: string;
          capacity_override?: number | null;
          cost_type?: CostType | null;
          cost_amount?: number | null;
          notes?: string | null;
          is_recurring?: boolean;
          is_blocked?: boolean;
          created_at?: Timestamp;
        },
        Partial<{
          venue_id: string;
          day_of_week: number | null;
          specific_date: string | null;
          start_time: string;
          end_time: string;
          capacity_override: number | null;
          cost_type: CostType | null;
          cost_amount: number | null;
          notes: string | null;
          is_recurring: boolean;
          is_blocked: boolean;
        }>
      >;
      venue_deals: TableDefinition<
        {
          id: string;
          venue_id: string;
          title: string;
          description: string | null;
          deal_type: DealType;
          deal_tier: DealTier;
          discount_value: string | null;
          valid_from: Timestamp | null;
          valid_until: Timestamp | null;
          is_active: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          venue_id: string;
          title: string;
          description?: string | null;
          deal_type: DealType;
          deal_tier: DealTier;
          discount_value?: string | null;
          valid_from?: Timestamp | null;
          valid_until?: Timestamp | null;
          is_active?: boolean;
          created_at?: Timestamp;
        },
        Partial<{
          venue_id: string;
          title: string;
          description: string | null;
          deal_type: DealType;
          deal_tier: DealTier;
          discount_value: string | null;
          valid_from: Timestamp | null;
          valid_until: Timestamp | null;
          is_active: boolean;
        }>
      >;
      groups: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          tags: string[];
          banner_url: string | null;
          city: string;
          visibility: GroupVisibility;
          join_mode: JoinMode;
          organizer_id: string;
          member_count: number;
          status: GroupStatus;
          is_featured: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id?: string | null;
          tags?: string[];
          banner_url?: string | null;
          city?: string;
          visibility?: GroupVisibility;
          join_mode?: JoinMode;
          organizer_id: string;
          member_count?: number;
          status?: GroupStatus;
          is_featured?: boolean;
          created_at?: Timestamp;
        },
        Partial<{
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          tags: string[];
          banner_url: string | null;
          city: string;
          visibility: GroupVisibility;
          join_mode: JoinMode;
          organizer_id: string;
          member_count: number;
          status: GroupStatus;
          is_featured: boolean;
        }>
      >;
      group_members: TableDefinition<
        {
          id: string;
          group_id: string;
          user_id: string;
          role: GroupMemberRole;
          status: GroupMemberStatus;
          joined_at: Timestamp;
        },
        {
          id?: string;
          group_id: string;
          user_id: string;
          role?: GroupMemberRole;
          status?: GroupMemberStatus;
          joined_at?: Timestamp;
        },
        Partial<{
          group_id: string;
          user_id: string;
          role: GroupMemberRole;
          status: GroupMemberStatus;
          joined_at: Timestamp;
        }>
      >;
      events: TableDefinition<
        {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          group_id: string | null;
          host_id: string;
          venue_id: string | null;
          category_id: string | null;
          event_type: EventType;
          status: EventStatus;
          starts_at: Timestamp;
          ends_at: Timestamp | null;
          venue_name: string | null;
          venue_address: string | null;
          latitude: number | null;
          longitude: number | null;
          online_link: string | null;
          featured_photo_url: string | null;
          gallery_photos: string[];
          attendee_limit: number | null;
          guest_limit: number;
          age_restriction: string;
          age_min: number | null;
          age_max: number | null;
          is_free: boolean;
          is_featured: boolean;
          is_sponsored: boolean;
          comments_enabled: boolean;
          rsvp_mode: RsvpMode;
          recurrence_rule: string | null;
          recurrence_end: string | null;
          parent_event_id: string | null;
          rsvp_count: number;
          waitlist_count: number;
          attendance_count: number;
          avg_rating: number | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          group_id?: string | null;
          host_id: string;
          venue_id?: string | null;
          category_id?: string | null;
          event_type?: EventType;
          status?: EventStatus;
          starts_at: Timestamp;
          ends_at?: Timestamp | null;
          venue_name?: string | null;
          venue_address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          online_link?: string | null;
          featured_photo_url?: string | null;
          gallery_photos?: string[];
          attendee_limit?: number | null;
          guest_limit?: number;
          age_restriction?: string;
          age_min?: number | null;
          age_max?: number | null;
          is_free?: boolean;
          is_featured?: boolean;
          is_sponsored?: boolean;
          comments_enabled?: boolean;
          rsvp_mode?: RsvpMode;
          recurrence_rule?: string | null;
          recurrence_end?: string | null;
          parent_event_id?: string | null;
          rsvp_count?: number;
          waitlist_count?: number;
          attendance_count?: number;
          avg_rating?: number | null;
          created_at?: Timestamp;
        },
        Partial<{
          title: string;
          slug: string;
          description: string | null;
          group_id: string | null;
          host_id: string;
          venue_id: string | null;
          category_id: string | null;
          event_type: EventType;
          status: EventStatus;
          starts_at: Timestamp;
          ends_at: Timestamp | null;
          venue_name: string | null;
          venue_address: string | null;
          latitude: number | null;
          longitude: number | null;
          online_link: string | null;
          featured_photo_url: string | null;
          gallery_photos: string[];
          attendee_limit: number | null;
          guest_limit: number;
          age_restriction: string;
          age_min: number | null;
          age_max: number | null;
          is_free: boolean;
          is_featured: boolean;
          is_sponsored: boolean;
          comments_enabled: boolean;
          rsvp_mode: RsvpMode;
          recurrence_rule: string | null;
          recurrence_end: string | null;
          parent_event_id: string | null;
          rsvp_count: number;
          waitlist_count: number;
          attendance_count: number;
          avg_rating: number | null;
        }>
      >;
      event_invites: TableDefinition<
        {
          id: string;
          event_id: string;
          invited_email: string | null;
          invited_user_id: string | null;
          status: InviteStatus;
          invited_by: string;
          created_at: Timestamp;
        },
        {
          id?: string;
          event_id: string;
          invited_email?: string | null;
          invited_user_id?: string | null;
          status?: InviteStatus;
          invited_by: string;
          created_at?: Timestamp;
        },
        Partial<{
          event_id: string;
          invited_email: string | null;
          invited_user_id: string | null;
          status: InviteStatus;
          invited_by: string;
        }>
      >;
      blocked_users: TableDefinition<
        {
          id: string;
          user_id: string;
          blocked_by: string;
          scope: BlockScope;
          scope_id: string | null;
          reason: string | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          user_id: string;
          blocked_by: string;
          scope: BlockScope;
          scope_id?: string | null;
          reason?: string | null;
          created_at?: Timestamp;
        },
        Partial<{
          user_id: string;
          blocked_by: string;
          scope: BlockScope;
          scope_id: string | null;
          reason: string | null;
        }>
      >;
      ticket_tiers: TableDefinition<
        {
          id: string;
          event_id: string;
          name: string;
          price_isk: number;
          price_usd: number;
          quantity: number;
          sold_count: number;
          sort_order: number;
        },
        {
          id?: string;
          event_id: string;
          name: string;
          price_isk?: number;
          price_usd?: number;
          quantity: number;
          sold_count?: number;
          sort_order?: number;
        },
        Partial<{
          event_id: string;
          name: string;
          price_isk: number;
          price_usd: number;
          quantity: number;
          sold_count: number;
          sort_order: number;
        }>
      >;
      rsvps: TableDefinition<
        {
          id: string;
          event_id: string;
          user_id: string;
          ticket_tier_id: string | null;
          status: RsvpStatus;
          guest_count: number;
          attended: AttendanceStatus | null;
          checked_in_at: Timestamp | null;
          waitlisted_at: Timestamp | null;
          qr_code: string | null;
          payment_id: string | null;
          payment_status: string;
          amount_paid: number | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          event_id: string;
          user_id: string;
          ticket_tier_id?: string | null;
          status?: RsvpStatus;
          guest_count?: number;
          attended?: AttendanceStatus | null;
          checked_in_at?: Timestamp | null;
          waitlisted_at?: Timestamp | null;
          qr_code?: string | null;
          payment_id?: string | null;
          payment_status?: string;
          amount_paid?: number | null;
          created_at?: Timestamp;
        },
        Partial<{
          event_id: string;
          user_id: string;
          ticket_tier_id: string | null;
          status: RsvpStatus;
          guest_count: number;
          attended: AttendanceStatus | null;
          checked_in_at: Timestamp | null;
          waitlisted_at: Timestamp | null;
          qr_code: string | null;
          payment_id: string | null;
          payment_status: string;
          amount_paid: number | null;
        }>
      >;
      event_comments: TableDefinition<
        {
          id: string;
          event_id: string;
          user_id: string;
          text: string;
          is_pinned: boolean;
          parent_id: string | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          event_id: string;
          user_id: string;
          text: string;
          is_pinned?: boolean;
          parent_id?: string | null;
          created_at?: Timestamp;
        },
        Partial<{
          event_id: string;
          user_id: string;
          text: string;
          is_pinned: boolean;
          parent_id: string | null;
        }>
      >;
      event_ratings: TableDefinition<
        {
          id: string;
          event_id: string;
          user_id: string;
          rating: number;
          text: string | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          event_id: string;
          user_id: string;
          rating: number;
          text?: string | null;
          created_at?: Timestamp;
        },
        Partial<{
          event_id: string;
          user_id: string;
          rating: number;
          text: string | null;
        }>
      >;
      discussions: TableDefinition<
        {
          id: string;
          group_id: string;
          user_id: string;
          title: string;
          body: string;
          is_pinned: boolean;
          reply_count: number;
          created_at: Timestamp;
        },
        {
          id?: string;
          group_id: string;
          user_id: string;
          title: string;
          body: string;
          is_pinned?: boolean;
          reply_count?: number;
          created_at?: Timestamp;
        },
        Partial<{
          group_id: string;
          user_id: string;
          title: string;
          body: string;
          is_pinned: boolean;
          reply_count: number;
        }>
      >;
      discussion_replies: TableDefinition<
        {
          id: string;
          discussion_id: string;
          user_id: string;
          text: string;
          created_at: Timestamp;
        },
        {
          id?: string;
          discussion_id: string;
          user_id: string;
          text: string;
          created_at?: Timestamp;
        },
        Partial<{
          discussion_id: string;
          user_id: string;
          text: string;
        }>
      >;
      venue_reviews: TableDefinition<
        {
          id: string;
          venue_id: string;
          reviewer_id: string;
          event_id: string;
          reviewer_type: ReviewerType;
          rating: number;
          text: string | null;
          venue_response: string | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          venue_id: string;
          reviewer_id: string;
          event_id: string;
          reviewer_type: ReviewerType;
          rating: number;
          text?: string | null;
          venue_response?: string | null;
          created_at?: Timestamp;
        },
        Partial<{
          venue_id: string;
          reviewer_id: string;
          event_id: string;
          reviewer_type: ReviewerType;
          rating: number;
          text: string | null;
          venue_response: string | null;
        }>
      >;
      venue_bookings: TableDefinition<
        {
          id: string;
          venue_id: string;
          organizer_id: string;
          event_id: string | null;
          requested_date: string;
          requested_start: string;
          requested_end: string;
          expected_attendance: number | null;
          event_description: string | null;
          message: string | null;
          status: BookingStatus;
          venue_response: string | null;
          counter_offer: Json;
          created_at: Timestamp;
          updated_at: Timestamp;
        },
        {
          id?: string;
          venue_id: string;
          organizer_id: string;
          event_id?: string | null;
          requested_date: string;
          requested_start: string;
          requested_end: string;
          expected_attendance?: number | null;
          event_description?: string | null;
          message?: string | null;
          status?: BookingStatus;
          venue_response?: string | null;
          counter_offer?: Json;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        },
        Partial<{
          venue_id: string;
          organizer_id: string;
          event_id: string | null;
          requested_date: string;
          requested_start: string;
          requested_end: string;
          expected_attendance: number | null;
          event_description: string | null;
          message: string | null;
          status: BookingStatus;
          venue_response: string | null;
          counter_offer: Json;
          updated_at: Timestamp;
        }>
      >;
      notifications: TableDefinition<
        {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          link: string | null;
          is_read: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: Timestamp;
        },
        Partial<{
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          link: string | null;
          is_read: boolean;
        }>
      >;
      messages: TableDefinition<
        {
          id: string;
          sender_id: string;
          receiver_id: string;
          subject: string | null;
          body: string;
          is_read: boolean;
          thread_id: string;
          created_at: Timestamp;
        },
        {
          id?: string;
          sender_id: string;
          receiver_id: string;
          subject?: string | null;
          body: string;
          is_read?: boolean;
          thread_id?: string;
          created_at?: Timestamp;
        },
        Partial<{
          sender_id: string;
          receiver_id: string;
          subject: string | null;
          body: string;
          is_read: boolean;
          thread_id: string;
        }>
      >;
      transactions: TableDefinition<
        {
          id: string;
          user_id: string;
          type: TransactionType;
          description: string;
          amount_isk: number | null;
          amount_usd: number | null;
          commission_amount: number | null;
          payment_provider: string | null;
          payment_id: string | null;
          status: string;
          related_event_id: string | null;
          related_venue_id: string | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          user_id: string;
          type: TransactionType;
          description: string;
          amount_isk?: number | null;
          amount_usd?: number | null;
          commission_amount?: number | null;
          payment_provider?: string | null;
          payment_id?: string | null;
          status?: string;
          related_event_id?: string | null;
          related_venue_id?: string | null;
          created_at?: Timestamp;
        },
        Partial<{
          user_id: string;
          type: TransactionType;
          description: string;
          amount_isk: number | null;
          amount_usd: number | null;
          commission_amount: number | null;
          payment_provider: string | null;
          payment_id: string | null;
          status: string;
          related_event_id: string | null;
          related_venue_id: string | null;
        }>
      >;
      admin_audit_log: TableDefinition<
        {
          id: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string | null;
          details: Json;
          created_at: Timestamp;
        },
        {
          id?: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id?: string | null;
          details?: Json;
          created_at?: Timestamp;
        },
        Partial<{
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string | null;
          details: Json;
        }>
      >;
      platform_settings: TableDefinition<
        {
          key: string;
          value: Json;
          updated_at: Timestamp;
          updated_by: string | null;
        },
        {
          key: string;
          value?: Json;
          updated_at?: Timestamp;
          updated_by?: string | null;
        },
        Partial<{
          value: Json;
          updated_at: Timestamp;
          updated_by: string | null;
        }>
      >;
      event_templates: TableDefinition<
        {
          id: string;
          name: string;
          description_en: string;
          description_is: string;
          category_id: string | null;
          best_venue_type: string | null;
          best_time: string | null;
          suggested_capacity: string | null;
          amenities_needed: string[];
          is_active: boolean;
        },
        {
          id: string;
          name: string;
          description_en: string;
          description_is: string;
          category_id?: string | null;
          best_venue_type?: string | null;
          best_time?: string | null;
          suggested_capacity?: string | null;
          amenities_needed?: string[];
          is_active?: boolean;
        },
        Partial<{
          name: string;
          description_en: string;
          description_is: string;
          category_id: string | null;
          best_venue_type: string | null;
          best_time: string | null;
          suggested_capacity: string | null;
          amenities_needed: string[];
          is_active: boolean;
        }>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      current_account_type: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_group_member: {
        Args: { target_group_id: string };
        Returns: boolean;
      };
      can_manage_group: {
        Args: { target_group_id: string };
        Returns: boolean;
      };
      can_manage_event: {
        Args: { target_event_id: string };
        Returns: boolean;
      };
      can_manage_venue: {
        Args: { target_venue_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

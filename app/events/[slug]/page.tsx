import {NextResponse} from "next/server";
import {notFound} from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import {IEvent} from "@/database";
import {getSimilarEventsBySlug} from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";

// Define route params type for type safety
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


const EventDetailItem = ({icon, alt, label}: { icon: string, alt: string, label: string }) => (
  <section className='flex-row-gap-2 items-center'>
    <Image src={icon} alt={alt} width={17} height={17}/>
    <p>{label}</p>
  </section>
)

const EventAgenda = ({agendaItems}: { agendaItems: string[] }) => (
  <section className='agenda'>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map(item => (<li key={item}>{item}</li>))}
    </ul>
  </section>
)

const EventsTags = ({tags}: { tags: string[] }) => (
  <section className='flex flex-row gap-1.5 flex-wrap'>
    {tags.map(tag => (<div className='pill' key={tag}>{tag}</div>))}
  </section>
)

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
const EventDetailsPage = async ({params}: RouteParams) => {
  // Await and extract slug from params
  const {slug} = await params;

  // Validate slug parameter
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return NextResponse.json(
      {message: 'Invalid or missing slug parameter'},
      {status: 400}
    );
  }

  const request = await fetch(`${BASE_URL}/api/events/${slug}`, {});
  const {
    event: {
      title,
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      organizer,
      tags
    }
  } = await request.json();

  if (!description) return notFound();

  const bookings = 10;

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <section id='event'>
      <div className='header'>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className='details'>
        {/* LEFT SIDE - Event Content */}
        <aside className='content'>
          <Image src={image} alt='Event banner' width={800} height={800} className='banner'/>
          <section className='flex-col-gap-2'>
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>
          <section className='flex-col-gap-2'>
            <h2>Event Details</h2>
            <EventDetailItem icon='/icons/calendar.svg' alt='calendar' label={date}/>
            <EventDetailItem icon='/icons/clock.svg' alt='clock' label={time}/>
            <EventDetailItem icon='/icons/pin.svg' alt='pin' label={location}/>
            <EventDetailItem icon='/icons/mode.svg' alt='mode' label={mode}/>
            <EventDetailItem icon='/icons/audience.svg' alt='audience' label={audience}/>
          </section>
          <EventAgenda agendaItems={agenda}/>
          <section className='flex-col-gap-2'>
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>
          <EventsTags tags={tags}/>
        </aside>
        {/* RIGHT SIDE - Booking Form */}
        <aside className='booking'>
          <section className='signup-card'>
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className='text-sm'>Join {bookings} people who have already booked their spot!</p>
            ) : (
              <p className='text-sm'>Be the first to book your spot!</p>
            )}
            <BookEvent/>
          </section>
        </aside>
      </div>

      <div className='flex w-full flex-col gap-4 pt-20'>
        <h2>Similar Events</h2>
        <div className='events'>
          {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
            <EventCard key={similarEvent.id} {...similarEvent}  />
          ))}
        </div>
      </div>
    </section>
  )
}
export default EventDetailsPage

# Google Cloud Pub/Sub Event Tracking - Updated Setup

## Configuration

The system is configured to send events to these Google Cloud Pub/Sub topics:

### Event Topic (User Events)
- **Topic**: `projects/hackathon-478514/topics/ndsv-pubsub`
- **Purpose**: Track user actions (view_product, add_to_cart, checkout, purchase, search, comment, login, logout, page_view)

### Session Topic (Session Events)
- **Topic**: `projects/hackathon-478514/topics/session-topic`
- **Purpose**: Track session lifecycle (open_session, close_session)

## Server Configuration

### Environment Variables

Add to `server/.env`:

```env
# Enable Pub/Sub (set to 'true' to activate)
ENABLE_PUBSUB=true

# Google Cloud credentials (for local development)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

> **Note**: The GCP project ID and topic paths are hardcoded in the service (`hackathon-478514`).

## Event Structures

### User Event Schema

Sent to `event_topic` when users perform actions:

```json
{
  "session_id": "session_1234567890_abc",
  "user_id": "user_123",
  "event_name": "add_to_cart",
  "page_url": "/product_detail",
  "referrer": "https://google.com",
  "user_agent": "Mozilla/5.0...",
  "product_id": "prod_456",
  "product_name": "Widget Pro",
  "category": "Electronics",
  "price": 99.99,
  "quantity": 1
}
```

**Fields:**
- `session_id` - Auto-generated browser session ID
- `user_id` - User ID (null if not logged in)
- `event_name` - One of: view_product, add_to_cart, checkout, purchase, search, comment, login, logout, page_view
- `page_url` - Current page path
- `referrer` - Previous page URL
- `user_agent` - Browser user agent
- `product_id` - Product ID (null if not applicable)
- Additional fields depending on event type

### Session Event Schema

Sent to `session_topic` for session tracking:

```json
{
  "session_id": "session_1234567890_abc",
  "user_id": "user_123",
  "session_event_type": "open_session",
  "source": "google",
  "campaign": "summer_sale",
  "medium": "cpc"
}
```

**Fields:**
- `session_id` - Browser session ID
- `user_id` - User ID (null if not logged in)
- `session_event_type` - Either "open_session" or "close_session"
- `source` - UTM source parameter
- `campaign` - UTM campaign parameter
- `medium` - UTM medium parameter

## API Endpoints

### User Event
```
POST /api/events/user
Content-Type: application/json

{
  "session_id": "...",
  "user_id": "...",
  "event_name": "add_to_cart",
  ...
}
```

### Session Event
```
POST /api/events/session
Content-Type: application/json

{
  "session_id": "...",
  "user_id": "...",
  "session_event_type": "open_session",
  ...
}
```

### Health Check
```
GET /api/events/health
```

## Usage Examples

### Track Product View

```typescript
import { useEventTracking } from '@/hooks/useEventTracking';

function ProductPage({ product }) {
  const { trackViewProduct } = useEventTracking();

  useEffect(() => {
    trackViewProduct(
      product.id,
      product.name,
      product.category,
      product.price
    );
  }, [product.id]);
}
```

### Track Add to Cart

```typescript
const { trackAddToCart } = useEventTracking();

const handleAddToCart = () => {
  trackAddToCart(product.id, 1, product.price, product.name);
};
```

### Track Purchase

```typescript
const { trackPurchase } = useEventTracking();

const onOrderComplete = (order) => {
  trackPurchase(order.id, order.total);
};
```

### Track Search

```typescript
const { trackSearch } = useEventTracking();

const handleSearch = (query) => {
  trackSearch(query);
};
```

### Track Login/Logout

```typescript
const { trackLogin, trackLogout } = useEventTracking();

// After successful login
trackLogin();

// On logout
trackLogout();
```

### Track Session Open (App Initialization)

```typescript
import { useEventTracking } from '@/hooks/useEventTracking';

function App() {
  const { trackOpenSession } = useEventTracking();

  useEffect(() => {
    // Track session open on app mount
    trackOpenSession();
  }, []);

  return <YourApp />;
}
```

### Track Session Close (Before Unload)

```typescript
function App() {
  const { trackCloseSession } = useEventTracking();

  useEffect(() => {
    const handleBeforeUnload = () => {
      trackCloseSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}
```

## Automatic Features

### Session Management
- Session ID automatically generated and stored in `sessionStorage`
- Persists for browser session lifetime
- New session created when browser is closed and reopened

### User Context
- User ID automatically included from Redux store
- Set to `null` when user not authenticated

### UTM Tracking
- Automatically extracts `utm_source`, `utm_campaign`, `utm_medium` from URL
- Included in session events

### Offline Support
- Events queued in `localStorage` when offline
- Automatic retry every 30 seconds
- Separate queues for user events and session events

### Page Metadata
- `page_url` - Current pathname
- `referrer` - Document referrer
- `user_agent` - Browser user agent

## Testing

### 1. Check Health

```bash
curl http://localhost:8080/api/events/health
```

Expected response:
```json
{
  "pubsubEnabled": true,
  "status": "ready",
  "topics": {
    "event_topic": "projects/hackathon-478514/topics/ndsv-pubsub",
    "session_topic": "projects/hackathon-478514/topics/session-topic"
  }
}
```

### 2. Test User Event

```bash
curl -X POST http://localhost:8080/api/events/user \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_session1",
    "user_id": "test_user1",
    "event_name": "add_to_cart",
    "page_url": "/product_detail",
    "referrer": null,
    "user_agent": null,
    "product_id": "prod_123"
  }'
```

### 3. Test Session Event

```bash
curl -X POST http://localhost:8080/api/events/session \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_session1",
    "user_id": "test_user1",
    "session_event_type": "open_session",
    "source": "google",
    "campaign": "test_campaign",
    "medium": "cpc"
  }'
```

### 4. View Messages in GCP Console

1. Go to [Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic)
2. Select project `hackathon-478514`
3. Click on topic to view messages
4. Pull messages from subscription

## Prerequisites

### Create Service Account

```bash
# Set project
gcloud config set project hackathon-478514

# Create service account
gcloud iam service-accounts create pubsub-publisher \
  --display-name="Pub/Sub Publisher"

# Grant Pub/Sub Publisher role
gcloud projects add-iam-policy-binding hackathon-478514 \
  --member="serviceAccount:pubsub-publisher@hackathon-478514.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

# Create key
gcloud iam service-accounts keys create ./pubsub-key.json \
  --iam-account=pubsub-publisher@hackathon-478514.iam.gserviceaccount.com
```

### Verify Topics Exist

```bash
# List topics
gcloud pubsub topics list --project=hackathon-478514

# Should show:
# - projects/hackathon-478514/topics/ndsv-pubsub
# - projects/hackathon-478514/topics/session-topic
```

## Production Deployment (Cloud Run)

When deploying to Cloud Run, attach the service account:

```bash
gcloud run deploy hackathon-ecom-server \
  --service-account=pubsub-publisher@hackathon-478514.iam.gserviceaccount.com \
  --set-env-vars ENABLE_PUBSUB=true
```

No need to set `GOOGLE_APPLICATION_CREDENTIALS` - workload identity handles authentication.

## Troubleshooting

### Events not appearing in Pub/Sub

1. Check `ENABLE_PUBSUB=true` in `.env`
2. Verify service account has Publisher role
3. Check server logs for errors
4. Test health endpoint

### "Not configured" error

- Ensure `ENABLE_PUBSUB=true`
- Verify credentials file path
- Check GCP project ID is correct

### TypeScript errors

- Event types are in `src/types/eventTypes.ts`
- Import `useEventTracking` hook
- User ID comes from Redux store

## Event Name Reference

### User Events (event_topic)
- `view_product` - Product page view
- `add_to_cart` - Add item to cart
- `checkout` - Initiate checkout
- `purchase` - Complete purchase
- `search` - Search products
- `comment` - Post review/comment
- `login` - User login
- `logout` - User logout
- `page_view` - Generic page view

### Session Events (session_topic)
- `open_session` - Session start
- `close_session` - Session end

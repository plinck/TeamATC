type StravaEventUpdatesType = {
    title?: string;
}
type IncomingStravaEventType = {
    aspect_type: string; 
    event_time: number; 
    object_id: number; 
    object_type: string; 
    owner_id: number; 
    subscription_id: number; 
    updates?: StravaEventUpdatesType;
}
    
class StravaEvent {
    id?: string;
    aspect_type: string; 
    event_time: number; 
    object_id: number; 
    object_type: string; 
    owner_id: number; 
    subscription_id: number; 
    updates: StravaEventUpdatesType;
    updateDateTime: Date;

    constructor(event?: IncomingStravaEventType) {
        if (event) {
            this.id = `${event.object_id}`;
            this.aspect_type = event.aspect_type;
            this.event_time = event.event_time;
            this.object_id = event.object_id;
            this.object_type = event.object_type;
            this.owner_id = event.owner_id;
            this.subscription_id = event.subscription_id;
            if (event.updates) {
                this.updates = event.updates;
            }
            this.updateDateTime = new Date();   
        } else {
            this.id = "";
            this.aspect_type = "";
            this.event_time = 0;
            this.object_id = 0;
            this.object_type = "";
            this.owner_id = 0;
            this.subscription_id = 0;
            this.updates = {
                title: ""
            }
            this.updateDateTime = new Date();   
        }
    }
}

export {IncomingStravaEventType, StravaEvent}
    
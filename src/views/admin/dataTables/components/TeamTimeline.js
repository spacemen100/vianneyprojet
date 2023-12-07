import React, { useState, useEffect } from 'react';
import {
  Box, Text, Flex, Card, useColorModeValue, ChakraProvider, useToast, Tooltip, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, Input, Stack
} from '@chakra-ui/react';
import { FcPlus } from "react-icons/fc";
import 'react-calendar-timeline/lib/Timeline.css';

import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import 'moment/locale/fr'; // Import French locale
import { createClient } from '@supabase/supabase-js';
import './CalendarStyles.css';
import Menu from "components/menu/MainMenu";
import AddActionForm from './AddActionForm';

// Import the Timeline components from react-calendar-timeline
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline';

const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set moment to French locale
moment.locale('fr');

function TeamTimeline() {
  const [events, setEvents] = useState([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const onClose = () => setIsAlertOpen(false);
  const cancelRef = React.useRef();
  const toast = useToast();
  const [updatedEventName, setUpdatedEventName] = useState('');
  const [updatedEventStart, setUpdatedEventStart] = useState('');
  const [updatedEventEnd, setUpdatedEventEnd] = useState('');
  const [teams, setTeams] = useState([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const [visibleTimeStart, setVisibleTimeStart] = useState(moment().add(-12, 'hour').valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(moment().add(12, 'hour').valueOf());
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    // Function to fetch teams and events from Supabase
    const fetchTeamsAndEvents = async () => {
      try {
        let { data: teamsData, error: teamsError } = await supabase.from('vianney_teams').select('*');
        if (teamsError) throw teamsError;

        let { data: eventsData, error: eventsError } = await supabase.from('vianney_actions').select(`
          id,
          team_to_which_its_attached,
          starting_date,
          ending_date,
          action_name,
          color: team_to_which_its_attached (color)
        `);
        if (eventsError) throw eventsError;

        setTeams(teamsData);
        setEvents(eventsData.map(event => ({
          ...event,
          group: event.team_to_which_its_attached,
          start_time: moment(event.starting_date),
          end_time: moment(event.ending_date)
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({ /* ... */ });
      }
    };

    fetchTeamsAndEvents();
  }, [toast]);

  // Map teams to groups
  const groups = teams.map(team => ({
    id: team.id,
    title: team.name_of_the_team,
    color: team.color
  }));

  const items = events.map(event => ({
    id: event.id,
    group: event.resourceId,
    title: event.titel,
    start_time: moment(event.start),
    end_time: moment(event.end),
    itemProps: {
      style: {
        backgroundColor: event.color || 'lightgrey',
        color: 'white'
      }
    }
  }));







  const handleAddActionClick = () => {
    toast({
      title: "Ajouter une action",
      description: <AddActionForm />,
      status: "info",
      duration: null, // The toast will stay until manually closed
      isClosable: true,
      position: "top", // Center the toast at the top of the screen
    });
  };




  const handleMoveBackward = () => {
    const moveBy = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(visibleTimeStart - moveBy);
    setVisibleTimeEnd(visibleTimeEnd - moveBy);
  };

  const handleMoveForward = () => {
    const moveBy = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(visibleTimeStart + moveBy);
    setVisibleTimeEnd(visibleTimeEnd + moveBy);
  };



  const fetchTeams = async () => {
    const { data, error } = await supabase.from('vianney_teams').select('*');
    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
    console.log('Teams data:', data); // Check what the teams data looks like
    return data.map(team => ({
      id: team.id,
      title: team.name_of_the_team,
      color: team.color
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const teamsData = await fetchTeams();
      console.log('Teams data:', teamsData); // Check what the teams data looks like
      setTeams(teamsData);

      const { data: eventsData, error } = await supabase
        .from('team_action_view_rendering')
        .select('*');

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        const formattedEvents = eventsData.map(action => ({
          id: action.action_id,
          titel: action.action_name,
          start: new Date(action.starting_date),
          end: new Date(action.ending_date),
          resourceId: action.team_id,
          color: teamsData.find(t => t.id === action.team_id)?.color || 'lightgrey'
        }));
        setEvents(formattedEvents);
      }
    };

    fetchData();
  }, []);






  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: 'Aujourd hui',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucun événement pour cette période',
    errorEventSelect: 'Erreur lors de la sélection de l\'événement',
    errorEventUpdate: 'Erreur lors de la mise à jour de l\'événement',
    errorEventDelete: 'Erreur lors de la suppression de l\'événement',
    errorMissingEventId: 'Aucun événement sélectionné ou identifiant de l\'événement manquant',
    successEventDelete: 'Événement supprimé avec succès',
    successEventUpdate: 'Événement mis à jour avec succès',
    selectEventToModify: 'Sélectionnez un événement à modifier ou à supprimer.',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action ne peut pas être annulée.',
    updateEvent: 'Mettre à jour l\'événement',
    deleteEvent: 'Supprimer l\'événement',
    successMessage: 'Action réalisée avec succès',

  };


  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    // Log to debug
    console.log("Moving item:", itemId, "to time:", dragTime, "in group:", newGroupOrder);

    if (!dragTime) {
      return; // Ignore if dragTime is null
    }

    const updatedEvents = events.map(event => {
      if (event.id === itemId) {
        return {
          ...event,
          start_time: moment(dragTime),
          group: groups[newGroupOrder].id,
        };
      }
      return event;
    });

    setEvents(updatedEvents);

    if (dragTime) {
      updateEventInDatabase(itemId, {
        start_time: moment(dragTime).toISOString(),
      });
    }
  };

  const handleItemResize = (itemId, newStartTime, newEndTime) => {
    // Log to debug
    console.log("Resizing item:", itemId, "new start time:", newStartTime, "new end time:", newEndTime);

    if (!newStartTime || !newEndTime) {
      return; // Ignore if new start or end time is null
    }

    const updatedEvents = events.map(event => {
      if (event.id === itemId) {
        return {
          ...event,
          start_time: moment(newStartTime),
          end_time: moment(newEndTime),
        };
      }
      return event;
    });

    setEvents(updatedEvents);

    if (newStartTime && newEndTime) {
      updateEventInDatabase(itemId, {
        start_time: moment(newStartTime).toISOString(),
        end_time: moment(newEndTime).toISOString(),
      });
    }
  };

  const updateEventInDatabase = async (eventId, updatedData) => {
    try {
      // Check if updatedData contains valid start_time and end_time
      if (!updatedData.start_time || !updatedData.end_time) {
        throw new Error("Invalid start_time or end_time.");
      }
  
      const { error } = await supabase
        .from('vianney_actions')
        .update({
          starting_date: moment(updatedData.start_time).toISOString(),
          ending_date: moment(updatedData.end_time).toISOString(),
          // Add other fields if needed
        })
        .match({ id: eventId });
  
      if (error) throw error;
  
      toast({
        title: "Event Updated",
        description: "The event has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update the event.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setIsAlertOpen(true);
    setUpdatedEventName(event.titel);
    setUpdatedEventStart(moment(event.start).format('YYYY-MM-DDTHH:mm'));
    setUpdatedEventEnd(moment(event.end).format('YYYY-MM-DDTHH:mm'));
    // Don't set isUpdateMode here; let the user choose
  };

  const deleteEvent = async () => {
    console.log('Selected event on delete:', selectedEvent); // Log the event when attempting to delete

    if (!selectedEvent || typeof selectedEvent.id === 'undefined') {
      toast({
        title: "Error",
        description: "No event selected or event ID is missing.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const { error } = await supabase
      .from('vianney_actions')
      .delete()
      .match({ id: selectedEvent.id });

    if (error) {
      console.log(messages.errorEventDelete); // Log the error message
      toast({
        title: "Erreur lors de la suppression de l'événement",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      console.log(messages.successEventDelete); // Log the success message
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      toast({
        title: "Événement supprimé",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
    onClose();
  };

  const updateEvent = async () => {
    // Validation can be added here for updated event details
    const { error } = await supabase
      .from('vianney_actions')
      .update({
        action_name: updatedEventName,
        starting_date: updatedEventStart,
        ending_date: updatedEventEnd,
        last_updated: new Date() // update the last updated time
      })
      .match({ id: selectedEvent.id });

    if (error) {
      console.log(messages.errorEventUpdate); // Log the error message
      toast({
        title: "Erreur lors de la mise à jour de l'événement",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      console.log(messages.successEventUpdate); // Log the success message
      setEvents(events.map(event =>
        event.id === selectedEvent.id ? { ...event, titel: updatedEventName, start: new Date(updatedEventStart), end: new Date(updatedEventEnd) } : event
      ));
      toast({
        title: "Événement mis à jour",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
    onClose();
  };


  return (
    <Card
      direction='column'
      w='100%'
      px='0px'
      overflowX={{ sm: "scroll", lg: "hidden" }}>
      <Box p={4}>
        <ChakraProvider>
          <Box p={4}>
            <Flex px='25px' justify='space-between' mb='20px' align='center'>
              <Text
                color={textColor}
                fontSize='22px'
                fontWeight='700'
                lineHeight='100%'>
                Emploi du temps hello
              </Text>
              <Menu />
              <Tooltip label="Cliquer pour ajouter une action" hasArrow>
                <Box position='absolute' top='15px' right='15px' cursor='pointer'>
                  <FcPlus size="24px" onClick={handleAddActionClick} />
                </Box>
              </Tooltip>
            </Flex>
            <Box display="flex" justifyContent="center" mb={4}>
              <Button mr={2} onClick={handleMoveBackward}>Move Backward</Button>
              <Button onClick={handleMoveForward}>Move Forward</Button>
            </Box>

            {/* Replace the Timeline component with react-calendar-timeline */}
            <Timeline
              groups={groups}
              items={items}
              defaultTimeStart={moment().add(-12, 'minute')}
              defaultTimeEnd={moment().add(12, 'minute')}
              visibleTimeStart={visibleTimeStart}
              visibleTimeEnd={visibleTimeEnd}
              onItemMove={handleItemMove}
              onItemResize={handleItemResize}
            />

          </Box>
          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Options de l'événement
                </AlertDialogHeader>
                <AlertDialogBody>
                  {selectedEvent ? (
                    <Stack spacing={3}>
                      <Input
                        value={updatedEventName}
                        onChange={(e) => setUpdatedEventName(e.target.value)}
                        placeholder="Nom de l'événement"
                      />
                      <Input
                        type="datetime-local"
                        value={updatedEventStart}
                        onChange={(e) => setUpdatedEventStart(e.target.value)}
                      />
                      <Input
                        type="datetime-local"
                        value={updatedEventEnd}
                        onChange={(e) => setUpdatedEventEnd(e.target.value)}
                      />
                    </Stack>
                  ) : (
                    'Sélectionnez un événement à modifier ou à supprimer.'
                  )}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onClose}>
                    Annuler
                  </Button>
                  <Button colorScheme="blue" onClick={updateEvent} ml={3}>
                    Mettre à jour
                  </Button>
                  <Button colorScheme="red" onClick={deleteEvent} ml={3}>
                    Supprimer
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </ChakraProvider>
      </Box>
    </Card>
  );
}

export default TeamTimeline;

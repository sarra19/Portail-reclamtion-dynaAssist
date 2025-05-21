table 50118 "ChatConversation"
{
    DataClassification = ToBeClassified;

    fields
    {
        // Primary key
        field(1; "No_"; Integer)
        {
            AutoIncrement = true;
        }

        // Participants (comma-separated list of User IDs)
        field(2; "members"; Text[255])
        {
            DataClassification = CustomerContent;
        }

        // Messages (comma-separated list of Message IDs)
      
        // Timestamps
        field(4; "CreatedAt"; DateTime)
        {
        }

      
    }

    keys
    {
        key(PK; "No_")
        {
            Clustered = true;
        }
    }

    // Triggers to handle timestamps
}
table 50119 "Message"
{
    DataClassification = ToBeClassified;

    fields
    {
        // Primary key
        field(1; "No_"; Integer)
        {
            AutoIncrement = true;
        }

        // Sender ID (references the User table)
        field(2; "senderId"; text[255])
        {
          
        }

        // Receiver ID (references the User table)
        

        // Message content
        field(3; "text"; Text[255])
        {
        }
 field(4; "AttachedFile"; Text[255])
        {
            NotBlank = false;
        }
        // Timestamps
        field(5; "CreatedAt"; DateTime)
        {
        }

       field(6; "chatId"; Integer)
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

   

    
}
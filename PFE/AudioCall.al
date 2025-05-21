table 50120 "AudioCall"
{
    DataClassification = ToBeClassified;

    fields
    {
        field(1; "No_"; Text[50])
        {
        }

        field(2; "FromUserId"; Text[50]) 
        {
           
        }

        field(3; "ToUserId"; Text[255])
        {
            
        }

        field(4; "Verdict"; Option)
        {
            OptionMembers = "Pending","Accepted","Denied","Missed","Busy";
            OptionCaption = 'Pending,Accepted,Denied,Missed,Busy';
        }

        field(5; "Status"; Option)
        {
            OptionMembers = "Ongoing","Ended";
            OptionCaption = 'Ongoing,Ended';
        }

        field(6; "Started At"; DateTime)
        {
          
        }

        field(7; "Ended At"; DateTime)
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
   
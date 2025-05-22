table 50111 "Reclamation"
{
    DataClassification = ToBeClassified;

    fields
    {
        field(1; "No_"; Integer)
        {
            AutoIncrement = true;
        }
        field(2; "TargetType"; Text[50]) //service-product
        {
            NotBlank = true;
        }
        field(3; "Name"; Text[100])
        {
            NotBlank = true;
        }
        field(4; "Subject"; Text[255])
        {
            NotBlank = true;
        }
        field(5; "ComplaintType"; Option)
        {
            OptionMembers = textual,voice;
            NotBlank = true;
        }
        field(6; "AttachedFile"; Text[255])
        {
            NotBlank = false;
        }
        field(7; "Content"; Text[2048])
        {
            NotBlank = false;
        }
        field(8; "VoiceNote"; Text[255])
        { }
        field(9; "Status"; Option)
        {
            OptionMembers = in_progress,processed,resolved;
            OptionCaption = 'In Progress,processed,Resolved';
            InitValue = in_progress;
        }
        field(10; "UserId"; Text[50]) //envoyeur
        {
            NotBlank = false;
        }
        field(11; "ServiceId"; Text[50])
        {
            NotBlank = false;
        }
        field(12; "ProductId"; Text[50])
        {
            NotBlank = false;
        }
        field(13; "CreatedAt"; Date)
        {
        }
         field(14; "Receiver"; Text[50])
        {
        }
          field(15; "Archived"; Boolean)
        {
        }
          field(16; "Sender"; Text[50])
        {
        }
    }
    keys
    {
        key(MyKey; "No_")
        {

        }
    }
}

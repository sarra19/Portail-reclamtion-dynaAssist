table 50112 "Comment"
{
    DataClassification = ToBeClassified;

    fields
    {
        field(1; "No_"; Integer)
        {
            AutoIncrement = true;
        }
        field(2; "Content"; Text[2048])
        {
            NotBlank = true;
        }
        field(3; "Status"; Option)
        {
            OptionMembers = deleted,published,edited;
            OptionCaption = 'Deleted,Published,Edited';
            InitValue = published;
        }
         field(4; "AttachedFile"; Text[255])
        {
            NotBlank = false;
        }
        field(5; "ServiceId"; Text[50])
        {
            NotBlank = false;
        }
        field(6; "ProductId"; Text[50])
        {
            NotBlank = false;
        }
        field(7; "UserId"; Text[50])
        {
            NotBlank = true;
        }
          field(8; "CreatedAt"; DateTime)
        {
            NotBlank = true;
        }
    }

   
}
